import express from 'express';
import { Router } from 'express';
import multer from 'multer';
import {
  getAllContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from '../controllers/contacts.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { contactSchema, updateContactSchema } from '../validation/contacts.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = Router();

const jsonParser = express.json();

router.use(authenticate);

const upload = multer({ dest: 'uploads/' });

router.get('/', ctrlWrapper(getAllContacts));

router.get('/:contactId', isValidId, ctrlWrapper(getContactById));

router.post(
  '/',
  upload.single('photo'),
  jsonParser,
  validateBody(contactSchema),
  ctrlWrapper(createContact),
);

router.patch(
  '/:contactId',
  isValidId,
  upload.single('photo'),
  jsonParser,
  validateBody(updateContactSchema),
  ctrlWrapper(updateContact),
);

router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

export default router;
