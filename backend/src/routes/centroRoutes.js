const express = require('express');
const router = express.Router();
const { getCentrosReciclagem } = require('../controllers/centroController');

router.get('/', getCentrosReciclagem);

module.exports = router;
