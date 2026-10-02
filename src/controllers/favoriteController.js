const favoriteService = require('../services/favoriteService');

/**
 * POST /api/games/:gameId/favorite
 */
const addFavorite = async (req, res, next) => {
  try {
    const favorite = await favoriteService.addFavorite(req.user._id, req.params.gameId);

    res.status(201).json(favorite);
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/games/:gameId/favorite
 */
const removeFavorite = async (req, res, next) => {
  try {
    await favoriteService.removeFavorite(req.user._id, req.params.gameId);

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/favorites
 */
const listFavorites = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const result = await favoriteService.listFavorites(req.user._id, { page, limit });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/games/:gameId/favorite
 * Retorna { favorited: true/false } — útil para o frontend
 */
const checkFavorite = async (req, res, next) => {
  try {
    const result = await favoriteService.isFavorited(req.user._id, req.params.gameId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { addFavorite, removeFavorite, listFavorites, checkFavorite };
