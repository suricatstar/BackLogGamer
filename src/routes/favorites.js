const express = require('express');
const authenticate = require('../middlewares/authenticate');
const { listFavorites } = require('../controllers/favoriteController');

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/favorites
 * Lista todos os jogos favoritados pelo usuário autenticado.
 */
router.get('/', listFavorites);

module.exports = router;
