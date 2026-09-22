const express = require('express');
const router = express.Router();

// POST /api/atendimentos - Registrar novo atendimento / comanda
router.post('/', (req, res) => {
    const { id_cliente, itens, pagamentos } = req.body;
    /*
      Payload esperado:
      {
        "id_cliente": 1,
        "itens": [{ "id_servico_produto": 1, "quantidade": 1, "preco_unitario": 40.00 }],
        "pagamentos": [{ "forma_pagamento": "FIADO", "valor": 40.00 }]
      }
    */
    res.status(201).json({ message: "Atendimento e pagamentos registrados!", id_atendimento: 101 });
});

// POST /api/atendimentos/:id/quitar-fiado - Dar baixa em débitos pendentes
router.post('/:id/quitar-fiado', (req, res) => {
    const { valor_pago, forma_pagamento } = req.body;
    res.status(200).json({ message: "Pagamento do fiado registrado com sucesso!" });
});

module.exports = router;