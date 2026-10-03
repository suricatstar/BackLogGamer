const express = require('express');
const authenticate = require('../middlewares/authenticate');
const { getStats } = require('../controllers/statsController');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/me/stats:
 *   get:
 *     summary: Estatísticas do backlog do usuário
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Totais por status, horas jogadas e nota média
 *       401:
 *         description: Não autenticado
 */
/**
 * GET /api/me/stats
 * Retorna estatísticas do backlog do usuário autenticado.
 */
router.get('/stats', getStats);

module.exports = router;
