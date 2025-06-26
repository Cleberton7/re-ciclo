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
import { coletaUpload } from '../config/uploadConfig.js';

const router = express.Router();


// Middlewares específicos
const requireEmpresa = requireRole(['empresa']);
const requireCentro = requireRole(['centro']);

// Rotas autenticadas
router.get('/', verifyToken, requireAuth, getSolicitacoes);
router.post('/',verifyToken,requireEmpresa,rateLimiter(10, 60),coletaUpload,uploadErrorHandler,criarSolicitacao);

router.put('/:id/aceitar', verifyToken, requireCentro, aceitarColeta);
router.put('/:id/concluir', verifyToken, requireCentro, concluirColeta);

router.put('/:id',verifyToken,requireAuth,coletaUpload,uploadErrorHandler,atualizarColeta);

router.delete('/:id', verifyToken, requireAuth, deletarColeta);

// Rotas públicas (com cache)
router.get('/public/coletas', rateLimiter(30, 60), getColetasPublicas);
router.get('/public/estatisticas', rateLimiter(30, 60), getEstatisticasPublicas);
router.get('/public/distribuicao', rateLimiter(30, 60), getDistribuicaoMateriais);
router.get('/public/ranking', rateLimiter(30, 60), getRankingEmpresas);

export default router;