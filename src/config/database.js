const mongoose = require('mongoose');

/**
 * Conecta ao MongoDB usando a URI definida em MONGODB_URI.
 *
 * Por que separar isso num arquivo próprio?
 * Porque server.js não precisa saber *como* conectar ao banco,
 * só precisa saber *que* deve conectar antes de subir o servidor.
 * Separar responsabilidades facilita testes e manutenção.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erro ao conectar ao MongoDB: ${error.message}`);

    // Encerramos o processo porque sem banco a API não funciona.
    // O código 1 indica saída por erro (0 seria saída normal).
    process.exit(1);
  }
};

module.exports = connectDB;
