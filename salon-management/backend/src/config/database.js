const knex = require('knex');
const path = require('path');

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: path.resolve(__dirname, '../../salon_management.sqlite')
    },
    useNullAsDefault: true
});

// Inicialização automática das tabelas
async function initDb() {
    const hasClientes = await db.schema.hasTable('clientes');
    if (!hasClientes) {
        await db.schema.createTable('clientes', (table) => {
            table.increments('id_cliente').primary();
            table.string('nome', 100).notNullable();
            table.string('telefone', 20);
            table.date('data_nascimento');
            table.decimal('limite_credito', 10, 2).defaultTo(0.00);
            table.timestamp('data_cadastro').defaultTo(db.fn.now());
        });

        await db.schema.createTable('servicos_produtos', (table) => {
            table.increments('id_servico_produto').primary();
            table.string('nome', 100).notNullable();
            table.string('tipo', 20).notNullable(); // 'SERVICO' ou 'PRODUTO'
            table.decimal('preco_padrao', 10, 2).notNullable();
            table.integer('estoque_atual').defaultTo(0);
        });

        await db.schema.createTable('atendimentos', (table) => {
            table.increments('id_atendimento').primary();
            table.integer('id_cliente').unsigned().references('id_cliente').inTable('clientes').onDelete('SET NULL');
            table.timestamp('data_hora').defaultTo(db.fn.now());
            table.decimal('valor_total', 10, 2).notNullable().defaultTo(0.00);
            table.string('status_pagamento', 20).defaultTo('PENDENTE');
        });

        await db.schema.createTable('atendimento_itens', (table) => {
            table.increments('id_item').primary();
            table.integer('id_atendimento').unsigned().notNullable().references('id_atendimento').inTable('atendimentos').onDelete('CASCADE');
            table.integer('id_servico_produto').unsigned().notNullable().references('id_servico_produto').inTable('servicos_produtos');
            table.integer('quantidade').notNullable().defaultTo(1);
            table.decimal('preco_unitario', 10, 2).notNullable();
        });

        await db.schema.createTable('pagamentos', (table) => {
            table.increments('id_pagamento').primary();
            table.integer('id_atendimento').unsigned().notNullable().references('id_atendimento').inTable('atendimentos').onDelete('CASCADE');
            table.string('forma_pagamento', 20).notNullable(); // 'DINHEIRO', 'CARTAO', 'PIX', 'FIADO'
            table.decimal('valor', 10, 2).notNullable();
            table.timestamp('data_pagamento').defaultTo(db.fn.now());
        });

        // Carga inicial de testes
        await db('servicos_produtos').insert([
            { nome: 'Pé e Mão Completo', tipo: 'SERVICO', preco_padrao: 50.00, estoque_atual: 0 },
            { nome: 'Esmaltação em Gel', tipo: 'SERVICO', preco_padrao: 70.00, estoque_atual: 0 },
            { nome: 'Óleo Cuticular', tipo: 'PRODUTO', preco_padrao: 25.00, estoque_atual: 10 }
        ]);

        console.log('Banco de dados SQLite inicializado com sucesso.');
    }
}

initDb();

module.exports = db;