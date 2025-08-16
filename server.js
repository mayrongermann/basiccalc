// Importa o framework Express
const express = require('express');
// Cria uma instância do servidor
const app = express();
// Define a porta do servidor
const port = process.env.PORT || 3000;

// Serve os arquivos estáticos da pasta 'public'
// Isso significa que qualquer arquivo dentro de 'public'
// (como index.html, style.css, script.js)
// será acessível diretamente pelo navegador.
app.use(express.static('public'));

// Inicia o servidor na porta definida
app.listen(port, () => {
    console.log(`BasicCalc rodando em http://localhost:${port}`);
});