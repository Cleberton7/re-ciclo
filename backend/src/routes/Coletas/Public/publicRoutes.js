import express from 'express';
import {
  getColetasPublicas, // chama do coletaController
  getRankingEmpresas,
  getEstatisticasPublicas,
  getDistribuicaoMateriais,
  getEvolucaoColetas
} from '../../../controllers/Coletas/Public/publicController.js'
import { rateLimiter } from '../../../middlewares/rateLimiter.js';

const router = express.Router();

// Rotas públicas (com cache)
router.get('/coletas', rateLimiter(3000, 60), getColetasPublicas);
router.get('/estatisticas', rateLimiter(3000, 60), getEstatisticasPublicas);
router.get('/distribuicao', rateLimiter(3000, 60), getDistribuicaoMateriais);
router.get('/ranking', rateLimiter(3000, 60), getRankingEmpresas);
router.get('/evolucao', rateLimiter(3000, 60),getEvolucaoColetas);


export default router;
