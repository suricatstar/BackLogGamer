/**
 * globalTeardown roda UMA VEZ depois de todos os testes.
 * Para o servidor MongoDB em memória e libera a porta.
 */
module.exports = async () => {
  await global.__MONGOSERVER__.stop();
};
