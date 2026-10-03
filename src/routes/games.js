const express = require('express');
const authenticate = require('../middlewares/authenticate');
const { search, getById } = require('../controllers/gameController');
const { addFavorite, removeFavorite, checkFavorite } = require('../controllers/favoriteController');

const router = express.Router();

/**
 * Rotas de games são protegidas — só usuários autenticados podem buscar.
 * Isso evita uso indevido da nossa chave RAWG por terceiros.
 */
router.use(authenticate);

/**
 * @swagger
 * /api/games/search:
 *   get:
 *     summary: Busca jogos na RAWG (com cache Redis opcional)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema: { type: string }
 *         example: elden ring
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: pageSize
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Lista de jogos
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
/**
 * GET /api/games/search?query=elden+ring
 *
 * IMPORTANTE: esta rota deve ser declarada ANTES de /:id.
 * Se /:id viesse primeiro, Express interpretaria "search"
 * como um parâmetro dinâmico (id = "search").
 */
router.get('/search', search);

/**
 * @swagger
 * /api/games/{id}:
 *   get:
 *     summary: Detalhes de um jogo na RAWG
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Detalhes do jogo
 *       404:
 *         description: Jogo não encontrado
 */
/**
 * GET /api/games/:id
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/games/{gameId}/favorite:
 *   get:
 *     summary: Verifica se o jogo está favoritado
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Status de favorito
 *   post:
 *     summary: Favorita um jogo
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201:
 *         description: Favoritado
 *       409:
 *         description: Já está nos favoritos
 *   delete:
 *     summary: Remove dos favoritos
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       204:
 *         description: Removido
 */
/**
 * GET    /api/games/:gameId/favorite  → verifica se está favoritado
 * POST   /api/games/:gameId/favorite  → favorita
 * DELETE /api/games/:gameId/favorite  → desfavorita
 */
router.get('/:gameId/favorite', checkFavorite);
router.post('/:gameId/favorite', addFavorite);
router.delete('/:gameId/favorite', removeFavorite);

module.exports = router;
