const axios = require('axios');

/**
 * Cliente HTTP pré-configurado para a RAWG API.
 *
 * Por que criar uma instância axios dedicada?
 * - baseURL centralizada: não repetir a URL em cada chamada
 * - timeout global: se a RAWG demorar mais de 8s, abortamos
 * - params padrão: a api_key é injetada automaticamente em toda requisição
 *
 * Isso significa que qualquer chamada feita com este cliente
 * já terá a chave de autenticação — sem precisar lembrar de passá-la.
 */
const rawgClient = axios.create({
  baseURL: 'https://api.rawg.io/api',
  timeout: 8000, // 8 segundos — evita que a API externa trave nossa resposta
  params: {
    key: process.env.RAWG_API_KEY,
  },
});

module.exports = rawgClient;
