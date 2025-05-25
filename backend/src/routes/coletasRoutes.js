import express from 'express';
import { 
  getSolicitacoes, 
  criarSolicitacao, 
  aceitarColeta, 
  atualizarColeta,
  coletaUpload
} from '../controllers/coletaController.js';
import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rotas GET
router.get('/', verifyToken, getSolicitacoes);

// Rotas POST
router.post('/', verifyToken, coletaUpload, criarSolicitacao);

// Rotas PUT
router.put('/:id', verifyToken, coletaUpload, atualizarColeta);
router.put('/:id/aceitar', verifyToken, aceitarColeta);

export default router;