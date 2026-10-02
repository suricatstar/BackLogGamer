const { MongoMemoryServer } = require('mongodb-memory-server');

/**
 * globalSetup roda UMA VEZ antes de todos os testes de integração.
 *
 * Aqui iniciamos o MongoDB em memória e guardamos a URI
 * em process.env para que a aplicação conecte nele
 * em vez de no banco real.
 *
 * Por que MongoDB em memória?
 * - Testes não poluem dados reais
 * - Cada execução começa com banco limpo
 * - Não precisa de MongoDB instalado no CI
 * - Muito mais rápido que um banco real
 */
module.exports = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Guardamos no global para o teardown poder parar o servidor
  global.__MONGOSERVER__ = mongoServer;

  // Sobrescrevemos a URI para a aplicação usar o banco de testes
  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'test_secret_access';
  process.env.JWT_REFRESH_SECRET = 'test_secret_refresh';
  process.env.JWT_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
};
