import createError from 'http-errors';
import {
  getAllContactsService,
  getContactByIdService,
  createContactService,
  updateContactService,
  deleteContactService,
} from '../services/contacts.js';

export const getAllContacts = async (req, res) => {
  const response = await getAllContactsService();
  res.status(response.status).json(response);
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const response = await getContactByIdService(contactId);
  res.status(response.status).json(response);
};

export const createContact = async (req, res) => {
  const response = await createContactService(req.body);
  res.status(response.status).json(response);
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const response = await updateContactService(contactId, req.body);
  res.status(response.status).json(response);
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  const response = await deleteContactService(contactId);
  res.status(response.status).json(response);
};
