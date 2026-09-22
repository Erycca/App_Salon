const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');

router.get('/fiados', relatorioController.clientesDevedores);
router.get('/faturamento', relatorioController.faturamento);

// Novas rotas de exportação
router.get('/fiados/excel', relatorioController.exportarFiadosExcel);
router.get('/faturamento/pdf', relatorioController.exportarFaturamentoPDF);

module.exports = router;