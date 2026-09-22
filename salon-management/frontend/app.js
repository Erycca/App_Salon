const API_URL = 'http://localhost:3000/api';

// Estado da Comanda
let carrinho = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarClientes();
    carregarCatalogo();
    carregarDevedores();
    carregarRelatorios();
});

// Navegação de Abas
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    document.getElementById(`tab-${tabName}`).classList.add('active');
    event.currentTarget.classList.add('active');
}

// 1. CLIENTES
async function carregarClientes() {
    try {
        const res = await fetch(`${API_URL}/clientes`);
        const clientes = await res.json();

        const select = document.getElementById('select-cliente-atendimento');
        const lista = document.getElementById('lista-clientes');

        select.innerHTML = '<option value="">-- Atendimento Avulso --</option>';
        lista.innerHTML = '';

        clientes.forEach(c => {
            select.innerHTML += `<option value="${c.id_cliente}">${c.nome}</option>`;
            lista.innerHTML += `<li><span>${c.nome} - ${c.telefone || 'S/ Tel'}</span> <strong>R$ ${c.limite_credito.toFixed(2)}</strong></li>`;
        });
    } catch (e) {
        console.error('Erro ao buscar clientes:', e);
    }
}

async function cadastrarCliente(e) {
    e.preventDefault();
    const nome = document.getElementById('cli-nome').value;
    const telefone = document.getElementById('cli-telefone').value;
    const limite_credito = parseFloat(document.getElementById('cli-limite').value);

    await fetch(`${API_URL}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, telefone, limite_credito })
    });

    document.getElementById('form-cliente').reset();
    carregarClientes();
}

// 2. CATÁLOGO & ATENDIMENTO
async function carregarCatalogo() {
    try {
        const res = await fetch(`${API_URL}/servicos-produtos`);
        const itens = await res.json();

        const containerAtendimento = document.getElementById('lista-catalogo-atendimento');
        const listaCatalogo = document.getElementById('lista-catalogo');

        containerAtendimento.innerHTML = '';
        listaCatalogo.innerHTML = '';

        itens.forEach(item => {
            containerAtendimento.innerHTML += `
                <div class="catalog-item-card" onclick="adicionarAoCarrinho(${item.id_servico_produto}, '${item.nome}', ${item.preco_padrao})">
                    <strong>${item.nome}</strong><br>
                    <small>R$ ${item.preco_padrao.toFixed(2)}</small>
                </div>
            `;

            listaCatalogo.innerHTML += `
                <li>
                    <span>${item.nome} (${item.tipo})</span>
                    <strong>R$ ${item.preco_padrao.toFixed(2)} ${item.tipo === 'PRODUTO' ? `| Est: ${item.estoque_atual}` : ''}</strong>
                </li>
            `;
        });
    } catch (e) {
        console.error('Erro ao carregar catálogo:', e);
    }
}

function adicionarAoCarrinho(id, nome, preco) {
    const itemExistente = carrinho.find(i => i.id_servico_produto === id);
    if (itemExistente) {
        itemExistente.quantidade++;
    } else {
        carrinho.push({ id_servico_produto: id, nome, preco_unitario: preco, quantidade: 1 });
    }
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const container = document.getElementById('carrinho-itens');
    const totalEl = document.getElementById('total-atendimento');

    if (carrinho.length === 0) {
        container.innerHTML = '<p class="empty-msg">Nenhum item adicionado.</p>';
        totalEl.innerText = 'R$ 0,00';
        return;
    }

    let total = 0;
    container.innerHTML = '';

    carrinho.forEach(item => {
        const subtotal = item.quantidade * item.preco_unitario;
        total += subtotal;
        container.innerHTML += `
            <div class="cart-row">
                <span>${item.nome} (x${item.quantidade})</span>
                <strong>R$ ${subtotal.toFixed(2)}</strong>
            </div>
        `;
    });

    totalEl.innerText = `R$ ${total.toFixed(2)}`;
}

async function finalizarAtendimento() {
    if (carrinho.length === 0) return alert('Adicione pelo menos um item!');

    const id_cliente = document.getElementById('select-cliente-atendimento').value || null;
    const forma_pagamento = document.querySelector('input[name="pagamento"]:checked').value;

    if (forma_pagamento === 'FIADO' && !id_cliente) {
        return alert('Para pendurar (fiado), é obrigatório selecionar uma cliente cadastrada!');
    }

    const valor_total = carrinho.reduce((acc, i) => acc + (i.quantidade * i.preco_unitario), 0);

    const payload = {
        id_cliente,
        itens: carrinho,
        pagamentos: [{ forma_pagamento, valor: valor_total }]
    };

    const res = await fetch(`${API_URL}/atendimentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        alert('Atendimento registrado com sucesso!');
        carrinho = [];
        renderizarCarrinho();
        carregarDevedores();
        carregarRelatorios();
    }
}

// 3. FIADOS
async function carregarDevedores() {
    try {
        const res = await fetch(`${API_URL}/relatorios/fiados`);
        const devedores = await res.json();

        const tabela = document.getElementById('tabela-fiados');
        tabela.innerHTML = '';

        devedores.forEach(d => {
            tabela.innerHTML += `
                <tr>
                    <td>${d.nome}</td>
                    <td>${d.telefone || 'S/ Tel'}</td>
                    <td style="color: red; font-weight: bold;">R$ ${d.total_devido.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="alert('Quitação simulada via API')">Quitar</button>
                    </td>
                </tr>
            `;
        });
    } catch (e) {
        console.error('Erro ao buscar devedores:', e);
    }
}

// 4. RELATÓRIOS
async function carregarRelatorios() {
    try {
        const res = await fetch(`${API_URL}/relatorios/faturamento`);
        const faturamento = await res.json();

        const container = document.getElementById('cards-faturamento');
        container.innerHTML = '';

        faturamento.forEach(f => {
            container.innerHTML += `
                <div class="card">
                    <h3>${f.forma_pagamento}</h3>
                    <p style="font-size: 1.5rem; font-weight: bold; color: green;">R$ ${f.total_recebido.toFixed(2)}</p>
                    <small>${f.transacoes} transações</small>
                </div>
            `;
        });
    } catch (e) {
        console.error('Erro ao carregar relatórios:', e);
    }
}