import express from 'express';
import { 
  verifyToken, 
  requireAuth,
  requireRole
} from '../../../middlewares/authMiddleware.js';
import { 
  criarSolicitacao, 
  getSolicitacoes,
  aceitarColeta,
  atualizarColeta,
  deletarColeta,
  concluirColeta,

} from '../../../controllers/Coletas/Private/coletaController.js';
import createUploader, { uploadErrorHandler } from '../../../config/multerConfig.js';
import { rateLimiter } from '../../../middlewares/rateLimiter.js';
import { coletaUpload } from '../../../config/uploadConfig.js';
import { validarConclusaoColeta } from '../../../validators/coletaValidator.js';

const router = express.Router();


// Middlewares específicos
const requireEmpresa = requireRole(['empresa']);
const requireCentro = requireRole(['centro']);

// Rotas autenticadas
router.get('/', verifyToken, requireAuth, getSolicitacoes);
router.post('/',verifyToken,requireEmpresa,rateLimiter(10, 60),coletaUpload,uploadErrorHandler,criarSolicitacao);
router.put('/:id/aceitar', verifyToken, requireCentro, aceitarColeta);
router.put('/:id/concluir',verifyToken,requireCentro,express.json(),validarConclusaoColeta,concluirColeta);
router.put('/:id',verifyToken,requireAuth,coletaUpload,uploadErrorHandler,atualizarColeta);
router.delete('/:id', verifyToken, requireAuth, deletarColeta);



export default router;