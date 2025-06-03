import express from 'express';
import {
  criarNoticia,
  listarNoticias,
  buscarNoticiaPorSlug,
  atualizarNoticia,
  deletarNoticia
} from '../controllers/noticiaController.js';
import { verifyToken, requireLogin, checkUserType } from '../middlewares/authMiddleware.js';
import { createUploader, uploadErrorHandler } from '../config/multerConfig.js';

const router = express.Router();

// Configuração do upload para notícias
const noticiaUpload = createUploader({
  subfolder: 'noticias',
  fieldName: 'image',
  allowedTypes: ['IMAGE']
});

const apenasAdmGeral = [verifyToken, requireLogin, checkUserType(['adminGeral'])];

// Rotas públicas
router.get('/', listarNoticias);
router.get('/:slug', buscarNoticiaPorSlug);

// Rotas protegidas
router.post('/', noticiaUpload, ...apenasAdmGeral, uploadErrorHandler, criarNoticia);
router.put('/:id', noticiaUpload, ...apenasAdmGeral, uploadErrorHandler, atualizarNoticia);
router.delete('/:id', ...apenasAdmGeral, deletarNoticia);

export default router;