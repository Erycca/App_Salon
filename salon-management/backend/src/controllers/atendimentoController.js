const db = require('../config/database');

module.exports = {
    async criar(req, res) {
        const trx = await db.transaction();
        try {
            const { id_cliente, itens, pagamentos } = req.body;

            // 1. Calcular o Valor Total do Atendimento
            let valor_total = 0;
            for (const item of itens) {
                valor_total += item.quantidade * item.preco_unitario;
            }

            // 2. Determinar Status do Pagamento
            const valor_fiado = pagamentos
                .filter(p => p.forma_pagamento === 'FIADO')
                .reduce((acc, p) => acc + p.valor, 0);

            let status_pagamento = 'PAGO';
            if (valor_fiado >= valor_total) {
                status_pagamento = 'PENDENTE';
            } else if (valor_fiado > 0) {
                status_pagamento = 'PARCIAL';
            }

            // 3. Registrar o Atendimento
            const [id_atendimento] = await trx('atendimentos').insert({
                id_cliente,
                valor_total,
                status_pagamento
            });

            // 4. Inserir os Itens e dar baixa no estoque dos produtos
            for (const item of itens) {
                await trx('atendimento_itens').insert({
                    id_atendimento,
                    id_servico_produto: item.id_servico_produto,
                    quantidade: item.quantidade,
                    preco_unitario: item.preco_unitario
                });

                // Baixa no estoque
                await trx('servicos_produtos')
                    .where({ id_servico_produto: item.id_servico_produto, tipo: 'PRODUTO' })
                    .decrement('estoque_atual', item.quantidade);
            }

            // 5. Registrar os Pagamentos
            for (const pag of pagamentos) {
                await trx('pagamentos').insert({
                    id_atendimento,
                    forma_pagamento: pag.forma_pagamento,
                    valor: pag.valor
                });
            }

            await trx.commit();
            return res.status(201).json({ message: 'Atendimento registrado com sucesso!', id_atendimento });
        } catch (error) {
            await trx.rollback();
            return res.status(500).json({ error: 'Erro ao registrar atendimento.', details: error.message });
        }
    },

    async quitarFiado(req, res) {
        try {
            const { id } = req.params; // id_atendimento
            const { valor_pago, forma_pagamento } = req.body;

            // Registrar o pagamento de quitação
            await db('pagamentos').insert({
                id_atendimento: id,
                forma_pagamento,
                valor: valor_pago
            });

            // Atualizar status do atendimento para PAGO
            await db('atendimentos')
                .where({ id_atendimento: id })
                .update({ status_pagamento: 'PAGO' });

            return res.json({ message: 'Fiado quitado com sucesso!' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao quitar fiado.', details: error.message });
        }
    }
};