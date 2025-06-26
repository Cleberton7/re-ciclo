import express from 'express';
import {
  getColetas,
  getRanking,
  getEstatisticas,
  getDistribuicao
} from '../controllers/publicController.js';

const router = express.Router();

router.get('/coletas', getColetas);
router.get('/ranking', getRanking);
router.get('/estatisticas', getEstatisticas);
router.get('/distribuicao', getDistribuicao);

export default router;
