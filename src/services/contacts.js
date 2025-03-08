import Contact from '../models/contact.js';
import createError from 'http-errors';

export const getAllContactsService = async () => {
  const contacts = await Contact.find();
  return {
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  };
};

export const getContactByIdService = async (contactId) => {
  const contact = await Contact.findById(contactId);
  if (!contact) throw createError(404, 'Contact not found');

  return {
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  };
};

export const createContactService = async (data) => {
  const newContact = await Contact.create(data);
  return {
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  };
};

export const updateContactService = async (contactId, data) => {
  const updatedContact = await Contact.findByIdAndUpdate(contactId, data, {
    new: true,
  });
  if (!updatedContact) throw createError(404, 'Contact not found');

  return {
    status: 200,
    message: 'Successfully patched a contact!',
    data: updatedContact,
  };
};

export const deleteContactService = async (contactId) => {
  const deletedContact = await Contact.findByIdAndDelete(contactId);
  if (!deletedContact) throw createError(404, 'Contact not found');

  return { status: 204 };
};
