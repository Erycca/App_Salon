const db = require('../config/database');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

module.exports = {
    // ... métodos anteriores (clientesDevedores, faturamento) ...

    // 1. Exportar Relatório de Fiados em Excel (.xlsx)
    async exportarFiadosExcel(req, res) {
        try {
            const devedores = await db('clientes as c')
                .join('atendimentos as a', 'a.id_cliente', 'c.id_cliente')
                .join('pagamentos as p', 'p.id_atendimento', 'a.id_atendimento')
                .select('c.nome', 'c.telefone')
                .sum('p.valor as total_devido')
                .where('p.forma_pagamento', 'FIADO')
                .whereNot('a.status_pagamento', 'PAGO')
                .groupBy('c.id_cliente', 'c.nome', 'c.telefone')
                .having('total_devido', '>', 0)
                .orderBy('total_devido', 'desc');

            // Criar a planilha em memória
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Clientes Devedores');

            // Definir colunas e cabeçalhos
            worksheet.columns = [
                { header: 'Nome da Cliente', key: 'nome', width: 30 },
                { header: 'Telefone / WhatsApp', key: 'telefone', width: 20 },
                { header: 'Total Devido (R$)', key: 'total_devido', width: 20 }
            ];

            // Estilizar o cabeçalho
            worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } };
            worksheet.getRow(1).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'D81B60' } // Cor do Salon Management
            };

            // Adicionar linhas com dados
            devedores.forEach(d => {
                worksheet.addRow({
                    nome: d.nome,
                    telefone: d.telefone || 'Não informado',
                    total_devido: parseFloat(d.total_devido).toFixed(2)
                });
            });

            // Configurar cabeçalhos HTTP para download direto do arquivo
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', 'attachment; filename="relatorio_fiados.xlsx"');

            await workbook.xlsx.write(res);
            return res.end();

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao gerar Excel de fiados.', details: error.message });
        }
    },

    // 2. Exportar Relatório de Faturamento em PDF (.pdf)
    async exportarFaturamentoPDF(req, res) {
        try {
            const faturamento = await db('pagamentos')
                .select('forma_pagamento')
                .sum('valor as total_recebido')
                .count('* as transacoes')
                .groupBy('forma_pagamento');

            // Criar documento PDF
            const doc = new PDFDocument({ margin: 50 });

            // Configurar cabeçalhos HTTP para transmissão do PDF
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename="relatorio_faturamento.pdf"');

            doc.pipe(res);

            // Título do Relatório
            doc.fillColor('#880E4F').fontSize(20).text('Salon Management', { align: 'center' });
            doc.fontSize(14).text('Relatório de Faturamento por Forma de Pagamento', { align: 'center' });
            doc.moveDown(2);

            // Tabela simples no PDF
            doc.fillColor('#333333').fontSize(12);
            doc.text(`Data da Emissão: ${new Date().toLocaleDateString('pt-BR')}`);
            doc.moveDown();

            let totalGeral = 0;

            faturamento.forEach(f => {
                const total = parseFloat(f.total_recebido);
                totalGeral += total;

                doc.text(`• ${f.forma_pagamento}: R$ ${total.toFixed(2)} (${f.transacoes} lançamentos)`);
            });

            doc.moveDown();
            doc.fontSize(14).fillColor('#D81B60').text(`Total Geral: R$ ${totalGeral.toFixed(2)}`, { bold: true });

            doc.end();

        } catch (error) {
            return res.status(500).json({ error: 'Erro ao gerar PDF de faturamento.', details: error.message });
        }
    }
};