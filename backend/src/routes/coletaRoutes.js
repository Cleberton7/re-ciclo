import express from 'express';
import { verifyToken, verificarColetor } from '../middlewares/authMiddleware.js';
import {
  getSolicitacoes,
  aceitarColeta,
  criarSolicitacao
} from '../controllers/coletaController.js';

const router = express.Router();

router.get('/', verifyToken, getSolicitacoes);
router.post('/:id/aceitar', verifyToken, verificarColetor, aceitarColeta);
router.post('/', verifyToken, criarSolicitacao);

export default router;
