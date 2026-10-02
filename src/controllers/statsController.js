const statsService = require('../services/statsService');

/**
 * GET /api/me/stats
 */
const getStats = async (req, res, next) => {
  try {
    const stats = await statsService.getUserStats(req.user._id);

    res.status(200).json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats };
