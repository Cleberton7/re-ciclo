import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { 
  criarSolicitacao, 
  getSolicitacoes,
  aceitarColeta,
  atualizarColeta,
  deletarColeta 
} from '../controllers/coletaController.js';
import upload from '../config/multerConfig.js';
import { uploadErrorHandler } from '../config/multerConfig.js';

const router = express.Router();

const coletaUpload = upload({
  subfolder: 'coletas',
  fieldName: 'imagem'
});

router.get('/', verifyToken, getSolicitacoes);
router.post('/', verifyToken, coletaUpload, uploadErrorHandler, criarSolicitacao);
router.put('/:id/aceitar', verifyToken, aceitarColeta);
router.put('/:id', verifyToken, coletaUpload, uploadErrorHandler, atualizarColeta);
router.delete('/:id', verifyToken, deletarColeta); // Adicione esta nova rota

export default router;