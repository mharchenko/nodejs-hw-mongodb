import cloudinary from 'cloudinary';
import multer from 'multer';

import Contact from '../models/contact.js';
import createError from 'http-errors';

export const getAllContactsService = async (userId, query) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = query;
  const filter = { userId };

  if (type) filter.contactType = type;
  if (isFavourite !== undefined) filter.isFavourite = isFavourite === 'true';

  const totalItems = await Contact.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / perPage);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  const contacts = await Contact.find(filter)
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip((page - 1) * perPage)
    .limit(Number(perPage));

  return {
    data: {
      data: contacts,
      page: Number(page),
      perPage: Number(perPage),
      totalItems,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    },
  };
};

export const getContactByIdService = async (contactId, userId) => {
  const contact = await Contact.findOne({ _id: contactId, userId });
  if (!contact) throw createError(404, 'Contact not found');
  return contact;
};

// export const createContactService = async (data, userId) => {
//   return await Contact.create({ ...data, userId });
// };

// export const updateContactService = async (contactId, userId, data) => {
//   const updatedContact = await Contact.findOneAndUpdate(
//     { _id: contactId, userId },
//     data,
//     {
//       new: true,
//     },
//   );
//   if (!updatedContact) throw createError(404, 'Contact not found');
//   return updatedContact;
// };

export const deleteContactService = async (contactId, userId) => {
  const deletedContact = await Contact.findOneAndDelete({
    _id: contactId,
    userId,
  });
  if (!deletedContact) throw createError(404, 'Contact not found');
  return deletedContact;
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const createContactService = async (data, userId, file) => {
  let photoUrl = null;
  if (file) {
    const result = await cloudinary.uploader.upload(file.path);
    photoUrl = result.secure_url;
  }
  return await Contact.create({ ...data, userId, photo: photoUrl });
};

export const updateContactService = async (contactId, userId, data, file) => {
  let photoUrl = null;
  if (file) {
    const result = await cloudinary.uploader.upload(file.path);
    photoUrl = result.secure_url;
  }
  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactId, userId },
    { ...data, photo: photoUrl },
    { new: true },
  );
  if (!updatedContact) throw createError(404, 'Contact not found');
  return updatedContact;
};
