import { Router } from 'express';
import { getAllContacts, getContactById } from '../services/contacts.js';

const router = Router();

router.get('/', async (req, res) => {
  const response = await getAllContacts();
  res.status(response.status).json(response);
});

router.get('/:contactId', async (req, res) => {
  const { contactId } = req.params;
  const response = await getContactById(contactId);
  res.status(response.status).json(response);
});

export default router;
