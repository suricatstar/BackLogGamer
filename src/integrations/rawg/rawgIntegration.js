const rawgClient = require('./rawgClient');
const { getCache, setCache } = require('../../config/cache');

// TTLs do cache em segundos
const SEARCH_TTL = 10 * 60; // buscas: 10 minutos
const GAME_TTL = 60 * 60; // detalhes de jogo: 1 hora (mudam pouco)

/**
 * Camada de integração com a RAWG API.
 *
 * Responsabilidade única: fazer chamadas HTTP à RAWG e retornar
 * os dados brutos (ou uma versão minimamente tratada).
 *
 * NÃO contém lógica de negócio.
 * NÃO conhece req/res.
 * NÃO decide o que fazer quando um jogo não existe — isso é do Service.
 *
 * Por que separar integration de service?
 * Se amanhã a RAWG mudar sua API, ou você quiser trocar por outra fonte,
 * você altera apenas este arquivo — o service não muda.
 */

/**
 * Busca jogos por nome.
 * @param {string} query - Termo de busca
 * @param {number} page  - Página (1-indexed)
 * @param {number} pageSize - Itens por página (máx 40 na RAWG)
 */
const searchGames = async (query, page = 1, pageSize = 20) => {
  // Normaliza a chave: "Elden Ring " e "elden ring" usam a mesma entrada
  const cacheKey = `rawg:search:${String(query).trim().toLowerCase()}:${page}:${pageSize}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await rawgClient.get('/games', {
      params: {
        search: query,
        page,
        page_size: pageSize,
        ordering: '-rating', // mais bem avaliados primeiro
      },
    });

    await setCache(cacheKey, data, SEARCH_TTL);

    return data;
  } catch (error) {
    handleRawgError(error);
  }
};

/**
 * Busca detalhes de um jogo pelo ID da RAWG.
 * @param {number|string} gameId
 */
const getGameById = async (gameId) => {
  const cacheKey = `rawg:game:${gameId}`;

  const cached = await getCache(cacheKey);
  if (cached) return cached;

  try {
    const { data } = await rawgClient.get(`/games/${gameId}`);

    await setCache(cacheKey, data, GAME_TTL);

    return data;
  } catch (error) {
    handleRawgError(error);
  }
};

/**
 * Tratamento centralizado de erros da RAWG.
 *
 * Convertemos erros HTTP da RAWG em erros com statusCode,
 * para que o error middleware global consiga responder corretamente.
 *
 * Por que não deixar o erro original subir?
 * Porque ele contém detalhes internos (URL, chave de API, etc.)
 * que não devemos expor ao cliente.
 */
const handleRawgError = (error) => {
  // A RAWG respondeu com um status de erro (4xx, 5xx)
  if (error.response) {
    const status = error.response.status;

    if (status === 404) {
      const err = new Error('Jogo não encontrado na RAWG');
      err.statusCode = 404;
      throw err;
    }

    if (status === 401 || status === 403) {
      const err = new Error('Chave da RAWG API inválida ou sem permissão');
      err.statusCode = 502; // Bad Gateway — problema na integração, não no cliente
      throw err;
    }

    if (status === 429) {
      const err = new Error('Limite de requisições da RAWG atingido');
      err.statusCode = 503; // Service Unavailable temporário
      throw err;
    }

    const err = new Error('Erro ao consultar a RAWG API');
    err.statusCode = 502;
    throw err;
  }

  // A requisição foi feita mas não houve resposta (timeout, rede)
  if (error.request) {
    const err = new Error('RAWG API indisponível ou timeout');
    err.statusCode = 503;
    throw err;
  }

  // Erro ao montar a requisição
  throw error;
};

module.exports = { searchGames, getGameById };
