const express = require('express');
const authenticate = require('../middlewares/authenticate');
const { listFavorites } = require('../controllers/favoriteController');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: Lista os jogos favoritados do usuário
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de favoritos
 *       401:
 *         description: Não autenticado
 */
/**
 * GET /api/favorites
 * Lista todos os jogos favoritados pelo usuário autenticado.
 */
router.get('/', listFavorites);

module.exports = router;
