const knex = require('knex');
const path = require('path');

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, '../../salon_management.sqlite')
    },
    useNullAsDefault: true
});

async function runSeed() {
    console.log('🌱 Iniciando o povoamento (seed) do banco de dados...');

    try {
        // 1. Limpar tabelas existentes em ordem respeitando as chaves estrangeiras
        await db('pagamentos').del();
        await db('atendimento_itens').del();
        await db('atendimentos').del();
        await db('servicos_produtos').del();
        await db('clientes').del();

        // 2. Inserir Clientes Fictícios
        const [cli1, cli2, cli3, cli4] = await db('clientes').insert([
            { nome: 'Ana Clara Souza', telefone: '(13) 99712-3456', data_nascimento: '1995-04-12', limite_credito: 150.00 },
            { nome: 'Beatriz Lima', telefone: '(13) 99823-4567', data_nascimento: '1988-08-25', limite_credito: 200.00 },
            { nome: 'Carla Mendes', telefone: '(13) 99134-5678', data_nascimento: '2001-01-30', limite_credito: 100.00 },
            { nome: 'Daniela Oliveira', telefone: '(13) 99645-6789', data_nascimento: '1992-11-05', limite_credito: 120.00 }
        ], ['id_cliente']);

        // Compatibilidade de ID retornado pelo SQLite
        const idCli1 = typeof cli1 === 'object' ? cli1.id_cliente : cli1;
        const idCli2 = typeof cli2 === 'object' ? cli2.id_cliente : cli2 + 1;
        const idCli3 = typeof cli3 === 'object' ? cli3.id_cliente : cli3 + 2;

        console.log('✅ Clientes criados.');

        // 3. Inserir Catálogo de Serviços e Produtos
        const [sp1, sp2, sp3, sp4, sp5] = await db('servicos_produtos').insert([
            { nome: 'Pé e Mão Completo', tipo: 'SERVICO', preco_padrao: 50.00, estoque_atual: 0 },
            { nome: 'Esmaltação em Gel', tipo: 'SERVICO', preco_padrao: 70.00, estoque_atual: 0 },
            { nome: 'Spa dos Pés', tipo: 'SERVICO', preco_padrao: 45.00, estoque_atual: 0 },
            { nome: 'Óleo de Cutilagem (10ml)', tipo: 'PRODUTO', preco_padrao: 25.00, estoque_atual: 15 },
            { nome: 'Base Fortalecedora', tipo: 'PRODUTO', preco_padrao: 18.00, estoque_atual: 8 }
        ], ['id_servico_produto']);

        const idSp1 = typeof sp1 === 'object' ? sp1.id_servico_produto : sp1;
        const idSp2 = typeof sp2 === 'object' ? sp2.id_servico_produto : sp2 + 1;
        const idSp4 = typeof sp4 === 'object' ? sp4.id_servico_produto : sp4 + 3;

        console.log('✅ Catálogo de serviços e produtos criado.');

        // 4. Inserir Atendimentos / Comandas

        // Atendimento 1: Ana Clara - Pago no PIX
        const [atend1] = await db('atendimentos').insert({
            id_cliente: idCli1,
            valor_total: 75.00,
            status_pagamento: 'PAGO'
        }, ['id_atendimento']);
        const idAtend1 = typeof atend1 === 'object' ? atend1.id_atendimento : atend1;

        await db('atendimento_itens').insert([
            { id_atendimento: idAtend1, id_servico_produto: idSp1, quantidade: 1, preco_unitario: 50.00 },
            { id_atendimento: idAtend1, id_servico_produto: idSp4, quantidade: 1, preco_unitario: 25.00 }
        ]);
        await db('pagamentos').insert({
            id_atendimento: idAtend1,
            forma_pagamento: 'PIX',
            valor: 75.00
        });

        // Atendimento 2: Beatriz Lima - FIADO (Pendurado)
        const [atend2] = await db('atendimentos').insert({
            id_cliente: idCli2,
            valor_total: 70.00,
            status_pagamento: 'PENDENTE'
        }, ['id_atendimento']);
        const idAtend2 = typeof atend2 === 'object' ? atend2.id_atendimento : atend2 + 1;

        await db('atendimento_itens').insert([
            { id_atendimento: idAtend2, id_servico_produto: idSp2, quantidade: 1, preco_unitario: 70.00 }
        ]);
        await db('pagamentos').insert({
            id_atendimento: idAtend2,
            forma_pagamento: 'FIADO',
            valor: 70.00
        });

        // Atendimento 3: Carla Mendes - FIADO PARCIAL (Pagou 20 no Dinheiro, pendurou 45)
        const [atend3] = await db('atendimentos').insert({
            id_cliente: idCli3,
            valor_total: 65.00,
            status_pagamento: 'PARCIAL'
        }, ['id_atendimento']);
        const idAtend3 = typeof atend3 === 'object' ? atend3.id_atendimento : atend3 + 2;

        await db('atendimento_itens').insert([
            { id_atendimento: idAtend3, id_servico_produto: idSp1, quantidade: 1, preco_unitario: 50.00 },
            { id_atendimento: idAtend3, id_servico_produto: idSp4, quantidade: 1, preco_unitario: 15.00 }
        ]);
        await db('pagamentos').insert([
            { id_atendimento: idAtend3, forma_pagamento: 'DINHEIRO', valor: 20.00 },
            { id_atendimento: idAtend3, forma_pagamento: 'FIADO', valor: 45.00 }
        ]);

        console.log('✅ Atendimentos e lançamentos de caixa simulados.');
        console.log('🚀 Seed concluído com sucesso!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erro ao rodar o seed:', error);
        process.exit(1);
    }
}

runSeed();