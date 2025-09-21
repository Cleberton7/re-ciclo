import express from 'express';
import { verifyToken, requireRole } from '../middlewares/authMiddleware.js';
import createUploader, { uploadErrorHandler } from '../config/multerConfig.js';

import {
  getDadosEmpresa,
  getColetoresDisponiveis,
  atualizarLocalizacao,
  atualizarDados,

} from '../controllers/empresaController.js';

const router = express.Router();

// Configuração do upload para empresas
const uploadEmpresa = createUploader({
  subfolder: 'empresas',
  fieldName: 'imagemPerfil',
  allowedTypes: ['IMAGE'],
  maxFileSize: 2 * 1024 * 1024 // 2MB
});

// 🔹 Endpoints privados (empresa logada)
router.get('/dados', verifyToken, requireRole(['empresa']), getDadosEmpresa);
router.get('/coletores-disponiveis', verifyToken, requireRole(['empresa']), getColetoresDisponiveis);
router.put('/atualizar-localizacao', verifyToken, requireRole(['empresa']), atualizarLocalizacao);
router.put('/atualizar',verifyToken,requireRole(['empresa']),uploadEmpresa,uploadErrorHandler,atualizarDados);

// 🔹 Endpoints públicos
/*router.get('/localizacoes', getLocalizacoes);
router.get('/publicas/:id', getEmpresaPublicaPorId);*/


export default router;
