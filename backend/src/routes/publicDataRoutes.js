// routes/publicDataRoutes.js
import express from 'express';
import {
    getEmpresasPublicas,
    getCentrosPublicos,
    getEmpresasPorProximidade,
    getCentrosPorProximidade,
    getEmpresaPublicaPorId,
    getCentroPublicoPorId,
    getLocalizacoesEmpresas,
    getLocalizacoesCentros ,

} from '../controllers/publicDataController.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';
const router = express.Router();


// 🔹 Endpoints públicos
router.get('/localizacoesEmpresas', getLocalizacoesEmpresas);
router.get('/publicas/:id', getEmpresaPublicaPorId);
router.get('/publicas', rateLimiter(30, 60), getEmpresasPublicas);
router.get('/publicos', rateLimiter(30, 60),getCentrosPublicos);
router.get('/localizacoesCentros', getLocalizacoesCentros);
router.get('/publicos/:id', rateLimiter(30, 60), getCentroPublicoPorId);

// Novas rotas para busca por proximidade
router.get('/empresas/proximidade', getEmpresasPorProximidade);
router.get('/centros/proximidade', getCentrosPorProximidade);

export default router;