const { createClient } = require('redis');

/**
 * Cache com Redis (padrão cache-aside).
 *
 * Fluxo:
 * 1. Procura a resposta no cache
 * 2. Se achou (hit)  → devolve sem chamar a RAWG
 * 3. Se não (miss)   → chama a RAWG, guarda no cache com TTL e devolve
 *
 * Decisão de design: o cache é OPCIONAL e "fail-open".
 * Se o Redis não estiver configurado ou cair, a API segue funcionando
 * normalmente — só perde a otimização. Cache nunca deve derrubar a API.
 */

let client = null;
let ready = false;

/**
 * Conecta ao Redis se REDIS_URL estiver definida.
 * Chamado uma vez no start do servidor.
 */
const connectCache = async () => {
  if (!process.env.REDIS_URL) {
    console.log('ℹ️  REDIS_URL não definida — cache desativado');
    return;
  }

  client = createClient({
    url: process.env.REDIS_URL,
    // Não fica tentando reconectar para sempre: após 3 tentativas, desiste
    socket: {
      reconnectStrategy: (retries) => (retries > 3 ? false : retries * 200),
    },
  });

  client.on('error', (err) => {
    ready = false;
    console.error('⚠️  Redis erro:', err.message);
  });

  client.on('ready', () => {
    ready = true;
  });

  try {
    await client.connect();
    console.log('✅ Redis conectado — cache ativo');
  } catch (err) {
    ready = false;
    console.error('⚠️  Não foi possível conectar ao Redis — cache desativado');
  }
};

/**
 * Lê um valor do cache. Retorna null em miss ou se o Redis estiver indisponível.
 */
const getCache = async (key) => {
  if (!ready) return null;

  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

/**
 * Grava um valor no cache com TTL em segundos.
 * Falhas são ignoradas (fail-open).
 */
const setCache = async (key, value, ttlSeconds) => {
  if (!ready) return;

  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch {
    // ignora: cache é só otimização
  }
};

const disconnectCache = async () => {
  if (client && ready) {
    await client.quit();
  }
};

module.exports = { connectCache, getCache, setCache, disconnectCache };
