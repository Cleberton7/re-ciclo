import express from 'express';
import {
  getColetasPublicas, // chama do coletaController
  getRankingEmpresas,
  getEstatisticasPublicas,
  getDistribuicaoMateriais,
  getEvolucaoColetas
} from '../controllers/coletaController.js';

const router = express.Router();

router.get('/coletas', getColetasPublicas);
router.get('/ranking', getRankingEmpresas);
router.get('/estatisticas', getEstatisticasPublicas);
router.get('/distribuicao', getDistribuicaoMateriais);
router.get('/evolucao', getEvolucaoColetas);


export default router;
