// server.js

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// --- SIMULAÇÃO DE UM BANCO DE DADOS E RESPOSTAS DA API ASAAS ---
// No projeto real, estes dados viriam de consultas ao seu banco de dados e chamadas à API do Asaas.

let alunos = [
    { id: 101, nome: "Ana Clara Souza", responsavel: "Marcos Souza" },
    { id: 102, nome: "Lucas Mendes", responsavel: "Carla Mendes" },
    { id: 103, nome: "Beatriz Lima", responsavel: "Beatriz Lima" },
    { id: 104, nome: "João Gabriel", responsavel: "Fernanda Costa" },
    { id: 105, nome: "Mariana Oliveira", responsavel: "Pedro Oliveira" },
    { id: 106, nome: "Pedro Santos", responsavel: "Juliana Santos" },
];

let mensalidades = [
    { idAsaas: 'pay_111', alunoId: 101, valor: 700.00, vencimento: '2025-09-10', status: 'PAGO' },
    { idAsaas: 'pay_222', alunoId: 102, valor: 700.00, vencimento: '2025-09-10', status: 'VENCIDO' },
    { idAsaas: 'pay_333', alunoId: 103, valor: 700.00, vencimento: '2025-09-10', status: 'PAGO' },
    { idAsaas: 'pay_444', alunoId: 104, valor: 150.00, vencimento: '2025-09-15', status: 'PENDENTE', descricao: 'Taxa de Matrícula' },
    { idAsaas: 'pay_555', alunoId: 105, valor: 700.00, vencimento: '2025-09-10', status: 'PAGO' },
    { idAsaas: 'pay_666', alunoId: 106, valor: 700.00, vencimento: '2025-09-10', status: 'PENDENTE' },
];

let despesas = [
    { id: 1, descricao: "Salário - Equipe Pedagógica", categoria: "Salários", data: "2025-09-05", valor: 6500.00 },
    { id: 2, descricao: "Compra de material de limpeza", categoria: "Suprimentos", data: "2025-09-12", valor: 350.00 },
];
let proximaDespesaId = 3;

// --- ROTAS DA API ---

app.get('/', (req, res) => {
    res.redirect('/index.html');
});

// Rota principal que alimenta o dashboard
app.get('/api/financial-overview', (req, res) => {
    // No mundo real, você passaria um período (mês/ano) e filtraria as chamadas.
    // GET /api/v3/payments?dueDate[ge]=...&dueDate[le]=...

    const faturamentoPrevisto = mensalidades.reduce((acc, m) => acc + m.valor, 0);
    const valorRecebido = mensalidades.filter(m => m.status === 'PAGO').reduce((acc, m) => acc + m.valor, 0);
    const totalDespesas = despesas.reduce((acc, d) => acc + d.valor, 0);
    
    // Junta as informações dos alunos com suas mensalidades
    const relatorioMensalidades = mensalidades.map(mensalidade => {
        const aluno = alunos.find(a => a.id === mensalidade.alunoId);
        return {
            ...mensalidade,
            nomeAluno: aluno.nome,
            nomeResponsavel: aluno.responsavel,
            linkPagamento: `https://sandbox.asaas.com/pay/${mensalidade.idAsaas}` // Exemplo de link
        };
    });

    res.json({
        kpis: {
            faturamentoPrevisto,
            valorRecebido,
            totalDespesas,
            saldo: valorRecebido - totalDespesas
        },
        relatorioMensalidades,
        relatorioDespesas: despesas,
    });
});

// Rota para buscar alunos Adimplentes e Inadimplentes
app.get('/api/students/status', (req, res) => {
    // Lógica para determinar quem está inadimplente
    // No mundo real: GET /api/v3/payments?status=OVERDUE
    const idsInadimplentes = new Set(mensalidades.filter(m => m.status === 'VENCIDO').map(m => m.alunoId));
    
    const adimplentes = alunos.filter(a => !idsInadimplentes.has(a.id));
    const inadimplentes = alunos.filter(a => idsInadimplentes.has(a.id));

    res.json({ adimplentes, inadimplentes });
});

// Rota para adicionar uma nova despesa
app.post('/api/expenses', (req, res) => {
    const novaDespesa = {
        id: proximaDespesaId++,
        descricao: req.body.descricao,
        categoria: req.body.categoria,
        data: new Date().toISOString().split('T')[0], // Data de hoje
        valor: parseFloat(req.body.valor)
    };
    despesas.push(novaDespesa);
    console.log("Nova despesa adicionada:", novaDespesa);
    res.status(201).json(novaDespesa);
});

// Inicia o Servidor
app.listen(PORT, () => {
    console.log(`Servidor da Creche rodando em http://localhost:${PORT}`);
});