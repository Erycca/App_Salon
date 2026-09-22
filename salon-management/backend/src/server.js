const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/database');

const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste inicial
app.get('/', (req, res) => {
  return res.json({ message: "Backend do Salão rodando com sucesso!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
