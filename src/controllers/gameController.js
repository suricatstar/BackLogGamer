const gameService = require('../services/gameService');

/**
 * GET /api/games/search?query=elden+ring&page=1&limit=20
 */
const search = async (req, res, next) => {
  try {
    const { query, page = 1, limit = 20 } = req.query;

    const result = await gameService.searchGames({ query, page, limit });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/games/:id
 */
const getById = async (req, res, next) => {
  try {
    const game = await gameService.getGameById(req.params.id);

    res.status(200).json(game);
  } catch (error) {
    next(error);
  }
};

module.exports = { search, getById };
