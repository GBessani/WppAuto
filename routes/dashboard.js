import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.get('/api/contatos', (req, res) => {
  const filePath = path.resolve('./data/contatos.json');
  let data = [];

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    data = raw.trim() ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Erro ao ler contatos.json:', error.message);
  }

  res.json(data);
});

router.get('/dashboard', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Dashboard de Contatos</title>
    <style>
      body {
        font-family: 'Segoe UI', sans-serif;
        background-color: #f7f9fb;
        padding: 30px;
        color: #333;
      }
      h1 { color: #2c3e50; }
      table {
        width: 100%;
        border-collapse: collapse;
        background: #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        margin-top: 20px;
      }
      th, td {
        padding: 12px;
        border-bottom: 1px solid #ddd;
      }
      th {
        background-color: #3498db;
        color: white;
      }
      tr:hover {
        background-color: #f0f0f0;
      }
    </style>
  </head>
  <body>
    <h1>📋 Contatos Recebidos</h1>
    <table id="tabela">
      <thead>
        <tr>
          <th>Nome</th>
          <th>Número</th>
          <th>Mensagem</th>
          <th>Tipo</th>
          <th>Horário</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>

    <script>
      async function atualizarTabela() {
        const res = await fetch('/api/contatos');
        const data = await res.json();
        const tbody = document.querySelector('#tabela tbody');
        tbody.innerHTML = '';

        data.forEach(contato => {
          const linha = document.createElement('tr');
          linha.innerHTML = \`
            <td>\${contato.nome}</td>
            <td>\${contato.numero}</td>
            <td>\${contato.mensagem}</td>
            <td>\${contato.tipo}</td>
            <td>\${contato.horario}</td>
          \`;
          tbody.appendChild(linha);
        });
      }

      atualizarTabela();
      setInterval(atualizarTabela, 5000); // atualiza a cada 5 segundos
    </script>
  </body>
  </html>
  `;

  res.send(html);
});

export default router;
