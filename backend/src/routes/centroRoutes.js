import express from 'express';
import { getCentrosReciclagem } from '../controllers/centroController.js';

const router = express.Router();
router.get('/', getCentrosReciclagem);
export default router;