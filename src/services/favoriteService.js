const Favorite = require('../models/Favorite');
const rawg = require('../integrations/rawg/rawgIntegration');

/**
 * FavoriteService — lógica de negócio de favoritos.
 *
 * Busca os dados do jogo na RAWG antes de salvar,
 * assim garantimos que o gameId é válido e já guardamos o título e capa.
 */

/**
 * Favorita um jogo.
 * Busca na RAWG para validar o gameId e capturar título/capa.
 */
const addFavorite = async (userId, gameId) => {
  // Valida se o jogo existe na RAWG e captura dados básicos
  const game = await rawg.getGameById(gameId);

  try {
    const favorite = await Favorite.create({
      user: userId,
      gameId: game.id,
      gameTitle: game.name,
      gameCover: game.background_image ?? null,
    });

    return favorite;
  } catch (err) {
    if (err.code === 11000) {
      const error = new Error('Jogo já está nos seus favoritos');
      error.statusCode = 409;
      throw error;
    }
    throw err;
  }
};

/**
 * Remove um jogo dos favoritos.
 * Filtra por user E gameId — somente o dono pode remover.
 */
const removeFavorite = async (userId, gameId) => {
  const favorite = await Favorite.findOneAndDelete({
    user: userId,
    gameId: Number(gameId),
  });

  if (!favorite) {
    const error = new Error('Favorito não encontrado');
    error.statusCode = 404;
    throw error;
  }

  return favorite;
};

/**
 * Lista todos os favoritos do usuário com paginação.
 */
const listFavorites = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Favorite.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),

    Favorite.countDocuments({ user: userId }),
  ]);

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Verifica se um jogo específico está nos favoritos do usuário.
 * Útil para o frontend saber se deve mostrar o ícone preenchido ou não.
 */
const isFavorited = async (userId, gameId) => {
  const favorite = await Favorite.findOne({ user: userId, gameId: Number(gameId) });
  return { favorited: !!favorite };
};

module.exports = { addFavorite, removeFavorite, listFavorites, isFavorited };
