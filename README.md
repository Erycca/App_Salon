---

## 📊 Exportação de Relatórios (PDF e Excel)

O sistema conta com endpoints para download direto de relatórios gerenciais estruturados:

### Dependências Utilizadas
* **ExcelJS:** Geração dinâmica de planilhas `.xlsx` formatadas.
* **PDFKit:** Renderização em tempo real de relatórios financeiros em `.pdf`.

### Endpoints de Exportação
* **`GET /api/relatorios/fiados/excel`**
  * **Descrição:** Faz o download da planilha contendo a lista completa de clientes devedoras, seus telefones de contato e o total devido acumulado.
  * **Formato:** `.xlsx`

* **`GET /api/relatorios/faturamento/pdf`**
  * **Descrição:** Gera o documento PDF consolidado com o faturamento por forma de pagamento (PIX, Cartão, Dinheiro e Fiado) e o total geral arrecadado no período.
  * **Formato:** `.pdf`

### Como usar no Frontend
Os links de download utilizam chamadas HTTP diretas no navegador (`target="_blank"`), permitindo que a usuária baixe os arquivos diretamente da interface sem necessidade de bibliotecas adicionais no cliente:

```html
<a href="http://localhost:3000/api/relatorios/fiados/excel" class="btn" target="_blank">
  Baixar Relatório de Fiados (.XLSX)
</a>

<a href="http://localhost:3000/api/relatorios/faturamento/pdf" class="btn" target="_blank">
  Baixar Faturamento (.PDF)
</a>