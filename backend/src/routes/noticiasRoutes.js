import express from 'express';
import {
  criarNoticia,
  listarNoticias,
  buscarNoticiaPorSlug,
  atualizarNoticia,
  deletarNoticia,
  noticiaUpload
} from '../controllers/noticiaController.js';

import { verifyToken, requireLogin, checkUserType } from '../middlewares/authMiddleware.js';

const router = express.Router();

const apenasAdmGeral = [verifyToken, requireLogin, checkUserType(['admGeral'])];

// Rotas públicas
router.get('/', listarNoticias);
router.get('/:slug', buscarNoticiaPorSlug);

// Rotas protegidas
router.post('/', ...apenasAdmGeral, noticiaUpload, criarNoticia);
router.put('/:id', ...apenasAdmGeral, noticiaUpload, atualizarNoticia);
router.delete('/:id', ...apenasAdmGeral, deletarNoticia);

export default router;