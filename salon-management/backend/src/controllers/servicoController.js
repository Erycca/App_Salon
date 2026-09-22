const db = require('../config/database');

module.exports = {
    async listar(req, res) {
        try {
            const itens = await db('servicos_produtos').select('*').orderBy('nome', 'asc');
            return res.json(itens);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao carregar catálogo.', details: error.message });
        }
    },

    async criar(req, res) {
        try {
            const { nome, tipo, preco_padrao, estoque_atual } = req.body;
            const [id_servico_produto] = await db('servicos_produtos').insert({
                nome,
                tipo,
                preco_padrao,
                estoque_atual: tipo === 'PRODUTO' ? (estoque_atual || 0) : 0
            });

            return res.status(201).json({ message: 'Item adicionado ao catálogo!', id_servico_produto });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar item.', details: error.message });
        }
    },

    async atualizarEstoque(req, res) {
        try {
            const { id } = req.params;
            const { quantidade } = req.body; // Quantidade a somar/subtrair

            await db('servicos_produtos')
                .where({ id_servico_produto: id })
                .increment('estoque_atual', quantidade);

            return res.json({ message: 'Estoque atualizado com sucesso.' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar estoque.', details: error.message });
        }
    }
};