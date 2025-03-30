import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

import crypto from 'node:crypto';

import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';

import { User } from '../models/user.js';
import { Session } from '../models/Session.js';

export async function registerUser(payload) {
  const user = await User.findOne({ email: payload.email });

  if (user !== null) {
    throw createHttpError[409]('Email in use');
  }

  payload.password = await bcrypt.hash(payload.password, 10);

  return User.create(payload);
}

export async function loginUser(email, password) {
  const user = await User.findOne({ email });

  if (user === null) {
    throw createHttpError[401]('Email or password is incorrect');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (isMatch !== true) {
    throw createHttpError[401]('Email or password is incorrect');
  }

  await Session.deleteOne({ userId: user._id });

  return Session.create({
    userId: user._id,
    accessToken: crypto.randomBytes(30).toString('base64'),
    refreshToken: crypto.randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + 1000 * 60 * 15),
    refreshTokenValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  });
}

export async function refreshSession(sessionId, refreshToken) {
  const currentSession = await Session.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (currentSession === null) {
    throw createHttpError[401]('Session not found');
  }

  if (currentSession.refreshTokenValidUntil < new Date()) {
    throw createHttpError[401]('Refresh token is expired');
  }

  await Session.deleteOne({
    _id: currentSession._id,
    refreshToken: currentSession.refreshToken,
  });

  return Session.create({
    userId: currentSession.userId,
    accessToken: crypto.randomBytes(30).toString('base64'),
    refreshToken: crypto.randomBytes(30).toString('base64'),
    accessTokenValidUntil: new Date(Date.now() + 1000 * 60 * 15),
    refreshTokenValidUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  });
}

export async function logoutUser(sessionId, refreshToken) {
  await Session.deleteOne({ _id: sessionId, refreshToken });

  return undefined;
}

export async function sendResetEmail(email) {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: '30m',
  });

  const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset your password',
    text: `Click this link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    return {};
  } catch (error) {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
}

export async function resetPassword(token, password) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      throw createHttpError(404, 'User not found!');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { email: decoded.email },
      { password: hashedPassword },
    );
    await Session.deleteMany({ userId: user._id });

    return {};
  } catch (error) {
    throw createHttpError(401, 'Token is expired or invalid.');
  }
}
