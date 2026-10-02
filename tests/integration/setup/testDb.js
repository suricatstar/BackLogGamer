const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

/**
 * Inicia o MongoDB em memória e conecta o Mongoose.
 * Chamado no beforeAll de cada arquivo de teste de integração.
 */
const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
};

/**
 * Limpa todos os dados entre testes — garante isolamento.
 * Chamado no afterEach.
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

/**
 * Fecha a conexão e para o servidor.
 * Chamado no afterAll.
 */
const disconnect = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
};

module.exports = { connect, clearDatabase, disconnect };
