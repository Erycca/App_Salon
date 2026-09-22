const express = require('express');
const router = express.Router();

// GET /api/clientes - Listar todos os clientes
router.get('/', (req, res) => {
    res.status(200).json({ message: "Lista de clientes retornada." });
});

// GET /api/clientes/:id - Buscar cliente por ID com saldo devedor
router.get('/:id', (req, res) => {
    const { id } = req.params;
    res.status(200).json({ id, nome: "Cliente Exemplo", saldo_devedor: 40.00 });
});

// POST /api/clientes - Cadastrar novo cliente
router.post('/', (req, res) => {
    const { nome, telefone, data_nascimento, limite_credito } = req.body;
    res.status(201).json({ message: "Cliente cadastrado com sucesso!", id: 1 });
});

// PUT /api/clientes/:id - Atualizar dados do cliente
router.put('/:id', (req, res) => {
    res.status(200).json({ message: "Dados do cliente atualizados." });
});

module.exports = router;