import express from 'express';
import { enviarContato } from '../controllers/contatoController.js';
import { contactLimiter } from '../middlewares/rateLimiter.js';
import { verifyRecaptcha } from '../middlewares/recaptcha.js';
import { contactValidationRules } from '../validators/contactValidator.js';
import { validate } from '../validators/validate.js';

const router = express.Router();

router.post(
  '/contato',
  contactLimiter,
  verifyRecaptcha,
  contactValidationRules(),
  validate,
  enviarContato
);

export default router;