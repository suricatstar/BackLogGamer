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
 * GET /api/games/search?query=elden+ring
 *
 * IMPORTANTE: esta rota deve ser declarada ANTES de /:id.
 * Se /:id viesse primeiro, Express interpretaria "search"
 * como um parâmetro dinâmico (id = "search").
 */
router.get('/search', search);

/**
 * GET /api/games/:id
 */
router.get('/:id', getById);

/**
 * GET    /api/games/:gameId/favorite  → verifica se está favoritado
 * POST   /api/games/:gameId/favorite  → favorita
 * DELETE /api/games/:gameId/favorite  → desfavorita
 */
router.get('/:gameId/favorite', checkFavorite);
router.post('/:gameId/favorite', addFavorite);
router.delete('/:gameId/favorite', removeFavorite);

module.exports = router;
