const express = require('express');
const { register, login, refresh } = require('../controllers/authController');

const router = express.Router();

/**
 * POST /api/auth/register
 * Cadastra um novo usuário.
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Autentica e retorna os tokens.
 */
router.post('/login', login);

/**
 * POST /api/auth/refresh
 * Gera um novo access token a partir do refresh token.
 * Body: { refreshToken }
 */
router.post('/refresh', refresh);

module.exports = router;
