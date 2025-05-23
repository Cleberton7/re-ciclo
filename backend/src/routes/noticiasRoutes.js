// /src/routes/noticiasRoutes.js
import express from 'express';
import {
  criarNoticia,
  listarNoticias,
  buscarNoticiaPorSlug,
  atualizarNoticia,
  deletarNoticia,
  upload
} from '../controllers/noticiaController.js';

import { verifyToken, requireLogin, checkUserType } from '../middlewares/authMiddleware.js';

const router = express.Router();

const apenasAdmGeral = [verifyToken, requireLogin, checkUserType(['admGeral'])];

// Rotas públicas
router.get('/', listarNoticias);
router.get('/:slug', buscarNoticiaPorSlug);

// Rotas protegidas
router.post('/', ...apenasAdmGeral, upload.single('image'), criarNoticia);
router.put('/:id', ...apenasAdmGeral, upload.single('image'), atualizarNoticia);
router.delete('/:id', ...apenasAdmGeral, deletarNoticia);

export default router;
