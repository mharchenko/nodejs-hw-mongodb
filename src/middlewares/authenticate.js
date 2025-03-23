import createHttpError from 'http-errors';

import { User } from '../models/user.js';
import { Session } from '../models/session.js';

export async function authenticate(req, res, next) {
  const { authorization } = req.headers;
  // console.log('Authorization Header:', authorization);

  if (typeof authorization !== 'string') {
    // console.log('Authorization header is not a string.');
    return next(createHttpError[401]('Please provide access token'));
  }

  const [bearer, accessToken] = authorization.split(' ', 2);
  // console.log('Bearer:', bearer, 'AccessToken:', accessToken);

  if (bearer !== 'Bearer' || typeof accessToken !== 'string') {
    // console.log('Invalid token format.');
    return next(createHttpError[401]('Please provide access token'));
  }

  const session = await Session.findOne({ accessToken });
  // console.log('Session:', session);

  if (session === null) {
    // console.log('Session not found.');
    return next(createHttpError[401]('Session not found'));
  }

  if (session.accessTokenValidUntil < new Date()) {
    // console.log('Access token expired.');
    return next(createHttpError[401]('Access token is expired'));
  }

  const user = await User.findById(session.userId);
  // console.log('User:', user);

  if (user === null) {
    // console.log('User not found.');
    return next(createHttpError[401]('User not found'));
  }

  req.user = { id: user._id, name: user.name };
  // console.log('Req.user before next():', req.user);

  next();
}
