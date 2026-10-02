const rawg = require('../integrations/rawg/rawgIntegration');

/**
 * GameService — orquestra a consulta de jogos via RAWG.
 *
 * Por que ter um service se a integration já faz a chamada?
 * O service é o lugar para transformar, filtrar e enriquecer os dados
 * antes de entregá-los ao controller.
 * Se amanhã quisermos cachear resultados ou combinar com dados locais,
 * isso vai aqui — sem tocar no controller ou na integration.
 */

/**
 * Busca jogos e retorna apenas os campos relevantes para nossa API.
 * A RAWG retorna dezenas de campos — filtramos para não expor dados desnecessários.
 */
const searchGames = async ({ query, page, limit }) => {
  if (!query || query.trim().length < 2) {
    const error = new Error('Query de busca deve ter pelo menos 2 caracteres');
    error.statusCode = 400;
    throw error;
  }

  const data = await rawg.searchGames(query.trim(), page, limit);

  return {
    results: data.results.map(formatGame),
    pagination: {
      count: data.count,
      next: data.next,
      previous: data.previous,
    },
  };
};

/**
 * Retorna os detalhes de um jogo específico.
 */
const getGameById = async (gameId) => {
  const game = await rawg.getGameById(gameId);

  return formatGameDetail(game);
};

/**
 * Formata um item de lista — campos resumidos.
 */
const formatGame = (game) => ({
  id: game.id,
  name: game.name,
  released: game.released,
  backgroundImage: game.background_image,
  rating: game.rating,
  ratingsCount: game.ratings_count,
  genres: game.genres?.map((g) => g.name) ?? [],
  platforms: game.platforms?.map((p) => p.platform.name) ?? [],
});

/**
 * Formata detalhe completo — mais campos para a tela de detalhe.
 */
const formatGameDetail = (game) => ({
  id: game.id,
  name: game.name,
  description: game.description_raw,
  released: game.released,
  backgroundImage: game.background_image,
  rating: game.rating,
  ratingsCount: game.ratings_count,
  metacritic: game.metacritic,
  playtime: game.playtime,
  genres: game.genres?.map((g) => g.name) ?? [],
  platforms: game.platforms?.map((p) => p.platform.name) ?? [],
  developers: game.developers?.map((d) => d.name) ?? [],
  publishers: game.publishers?.map((p) => p.name) ?? [],
  tags: game.tags?.slice(0, 10).map((t) => t.name) ?? [],
  website: game.website,
});

module.exports = { searchGames, getGameById };
