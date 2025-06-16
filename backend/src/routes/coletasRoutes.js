import express from 'express';
import { 
  verifyToken, 
  requireAuth,
  requireRole
} from '../middlewares/authMiddleware.js';
import { 
  criarSolicitacao, 
  getSolicitacoes,
  aceitarColeta,
  atualizarColeta,
  deletarColeta,
  concluirColeta,
  getColetasPublicas,
  getEstatisticasPublicas,
  getDistribuicaoMateriais,
  getRankingEmpresas
} from '../controllers/coletaController.js';
import createUploader, { uploadErrorHandler } from '../config/multerConfig.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Configuração do upload para coletas (CORREÇÃO: usar createUploader)
const coletaUpload = createUploader({
  subfolder: 'coletas',
  fieldName: 'imagem',
  allowedTypes: ['image/jpeg', 'image/png'],
  maxFileSize: 5 * 1024 * 1024 // 5MB
});

// Middlewares específicos
const requireEmpresa = requireRole(['empresa']);
const requireCentro = requireRole(['centro']);

// Rotas autenticadas
router.get('/', verifyToken, requireAuth, getSolicitacoes);
router.post(
  '/', 
  verifyToken, 
  requireEmpresa,
  rateLimiter(10, 60), // 10 requisições por hora
  coletaUpload, 
  uploadErrorHandler, 
  criarSolicitacao
);

router.put('/:id/aceitar', verifyToken, requireCentro, aceitarColeta);
router.put('/:id/concluir', verifyToken, requireCentro, concluirColeta);

router.put(
  '/:id', 
  verifyToken, 
  requireAuth,
  coletaUpload, 
  uploadErrorHandler, 
  atualizarColeta
);

router.delete('/:id', verifyToken, requireAuth, deletarColeta);

// Rotas públicas (com cache)
router.get('/public/coletas', rateLimiter(30, 60), getColetasPublicas);
router.get('/public/estatisticas', rateLimiter(30, 60), getEstatisticasPublicas);
router.get('/public/distribuicao', rateLimiter(30, 60), getDistribuicaoMateriais);
router.get('/public/ranking', rateLimiter(30, 60), getRankingEmpresas);

export default router;