const express = require('express');
const router = express.Router();

// GET /api/servicos-produtos - Listar catálogo e estoque
router.get('/', (req, res) => {
    res.status(200).json({ message: "Catálogo de produtos e serviços." });
});

// POST /api/servicos-produtos - Cadastrar novo item
router.post('/', (req, res) => {
    const { nome, tipo, preco_padrao, estoque_atual } = req.body;
    res.status(201).json({ message: "Item cadastrado com sucesso!" });
});

// PATCH /api/servicos-produtos/:id/estoque - Atualizar estoque
router.patch('/:id/estoque', (req, res) => {
    const { quantidade_adicionada } = req.body;
    res.status(200).json({ message: "Estoque atualizado com sucesso." });
});

module.exports = router;