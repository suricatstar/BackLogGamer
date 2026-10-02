require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/database');

const PORTA = process.env.PORT || 3001;

/**
 * Por que conectar ao banco antes do app.listen?
 * Se o listen viesse primeiro, a API aceitaria requisições
 * antes do banco estar pronto — o que causaria erros imediatos
 * em qualquer rota que usasse o banco de dados.
 */
const start = async () => {
  await connectDB();

  app.listen(PORTA, () => {
    console.log(`🚀 Servidor rodando na porta ${PORTA}`);
  });
};

start();