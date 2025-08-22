import express from 'express';
import {
  getDadosCentro,
  getCentrosDisponiveis,
  atualizarLocalizacao,
  getCentrosPublicos,
  getLocalizacoes,
  atualizarDados,
  getCentroPublicoPorId
} from '../controllers/centroController.js';

import { 
  verifyToken, 
  requireRole 
} from '../middlewares/authMiddleware.js';

import { rateLimiter } from '../middlewares/rateLimiter.js';
import createUploader, { uploadErrorHandler } from '../config/multerConfig.js';

const router = express.Router();
const requireCentro = requireRole(['centro']);

// Configuração de upload para centros
const uploadColetor = createUploader({
  subfolder: 'centros',
  fieldName: 'imagemPerfil',
  allowedTypes: ['image/jpeg', 'image/png'],
  maxFileSize: 2 * 1024 * 1024 // 2MB
});

router.get('/dados',verifyToken,requireCentro,getDadosCentro);
router.get('/centros-disponiveis',verifyToken,requireCentro,rateLimiter(15, 5),getCentrosDisponiveis);
router.put('/atualizar-localizacao',verifyToken,requireCentro,atualizarLocalizacao);
router.put('/atualizar',verifyToken,requireCentro,uploadColetor,uploadErrorHandler,atualizarDados);
router.get('/publicos',rateLimiter(30, 60),getCentrosPublicos);
router.get('/localizacoes',getLocalizacoes);
router.get('/publicos/:id', rateLimiter(30, 60), getCentroPublicoPorId);

export default router;
