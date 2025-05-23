// /src/routes/noticiasRoutes.js
import express from 'express';
import {
  criarNoticia,
  listarNoticias,
  buscarNoticiaPorSlug,
  atualizarNoticia,
  deletarNoticia
} from '../controllers/noticiaController.js';

import { verifyToken, requireLogin, checkUserType } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apenas admGeral pode criar, editar, deletar notícias
const apenasAdmGeral = [verifyToken, requireLogin, checkUserType(['admGeral'])];

// Rotas públicas
router.get('/', listarNoticias);
router.get('/:slug', buscarNoticiaPorSlug);

// Rotas protegidas (admGeral)
router.post('/', apenasAdmGeral, criarNoticia);
router.put('/:id', apenasAdmGeral, atualizarNoticia);
router.delete('/:id', apenasAdmGeral, deletarNoticia);

export default router;
