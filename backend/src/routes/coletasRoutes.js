import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
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
import upload from '../config/multerConfig.js';
import { uploadErrorHandler } from '../config/multerConfig.js';

const router = express.Router();

const coletaUpload = upload({
  subfolder: 'coletas',
  fieldName: 'imagem'
});

// Rotas autenticadas
router.get('/', verifyToken, getSolicitacoes);
router.post('/', verifyToken, coletaUpload, uploadErrorHandler, criarSolicitacao);
router.put('/:id/aceitar', verifyToken, aceitarColeta);
router.put('/:id', verifyToken, coletaUpload, uploadErrorHandler, atualizarColeta);
router.delete('/:id', verifyToken, deletarColeta);
router.put('/:id/concluir', verifyToken, concluirColeta);

// Rotas públicas (sem autenticação)
router.get('/public/coletas', getColetasPublicas);
router.get('/public/estatisticas', getEstatisticasPublicas);
router.get('/public/distribuicao', getDistribuicaoMateriais);
router.get('/public/ranking', getRankingEmpresas);


export default router;