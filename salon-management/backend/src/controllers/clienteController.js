const db = require('../config/database');

module.exports = {
    async listar(req, res) {
        try {
            const clientes = await db('clientes').select('*').orderBy('nome', 'asc');
            return res.json(clientes);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao listar clientes.', details: error.message });
        }
    },

    async buscarPorId(req, res) {
        try {
            const { id } = req.params;
            const cliente = await db('clientes').where({ id_cliente: id }).first();

            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado.' });
            }

            // Calcular o saldo devedor acumulado (Fiado)
            const [saldo] = await db('pagamentos as p')
                .join('atendimentos as a', 'a.id_atendimento', 'p.id_atendimento')
                .where('a.id_cliente', id)
                .where('p.forma_pagamento', 'FIADO')
                .whereNot('a.status_pagamento', 'PAGO')
                .sum('p.valor as total_devedor');

            cliente.saldo_devedor = saldo.total_devedor || 0.00;

            return res.json(cliente);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar cliente.', details: error.message });
        }
    },

    async criar(req, res) {
        try {
            const { nome, telefone, data_nascimento, limite_credito } = req.body;
            const [id_cliente] = await db('clientes').insert({
                nome,
                telefone,
                data_nascimento,
                limite_credito: limite_credito || 0.00
            });

            return res.status(201).json({ message: 'Cliente cadastrado com sucesso!', id_cliente });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao cadastrar cliente.', details: error.message });
        }
    }
};