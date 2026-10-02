const express = require('express');
const authenticate = require('../middlewares/authenticate');
const { getStats } = require('../controllers/statsController');

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/me/stats
 * Retorna estatísticas do backlog do usuário autenticado.
 */
router.get('/stats', getStats);

module.exports = router;
