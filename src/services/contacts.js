import Contact from '../models/contact.js';
import createError from 'http-errors';

export const getAllContactsService = async (query) => {
  const {
    page = 1,
    perPage = 10,
    sortBy = 'name',
    sortOrder = 'asc',
    type,
    isFavourite,
  } = query;
  const filter = {};

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

export const getContactByIdService = async (contactId) => {
  const contact = await Contact.findById(contactId);
  if (!contact) throw createError(404, 'Contact not found');
  return contact;
};

export const createContactService = async (data) => {
  return await Contact.create(data);
};

export const updateContactService = async (contactId, data) => {
  const updatedContact = await Contact.findByIdAndUpdate(contactId, data, {
    new: true,
  });
  if (!updatedContact) throw createError(404, 'Contact not found');
  return updatedContact;
};

export const deleteContactService = async (contactId) => {
  const deletedContact = await Contact.findByIdAndDelete(contactId);
  if (!deletedContact) throw createError(404, 'Contact not found');
  return deletedContact;
};
