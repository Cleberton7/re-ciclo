const express = require('express');
const router = express.Router();
const { getEmpresasParceiras } = require('../controllers/empresaController.js')

router.get('/', getEmpresasParceiras);

module.exports = router;
