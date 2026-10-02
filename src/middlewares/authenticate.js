const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware de autenticação JWT.
 *
 * Fluxo:
 * 1. Extrai o token do header Authorization: Bearer <token>
 * 2. Verifica a assinatura e a expiração com jwt.verify()
 * 3. Busca o usuário no banco para garantir que ainda existe
 * 4. Anexa o usuário em req.user para os controllers usarem
 *
 * Por que buscar o usuário no banco e não só confiar no token?
 * O token pode ter sido emitido para um usuário que foi deletado.
 * Buscar no banco garante que o usuário ainda existe.
 *
 * Por que não colocar todos os dados do usuário no token?
 * O token é enviado em toda requisição. Quanto maior, mais bytes trafegam.
 * Também, dados no token ficam desatualizados se o usuário mudar o nome.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('Token não fornecido');
      error.statusCode = 401;
      throw error;
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 401;
      throw error;
    }

    req.user = user; // disponibiliza o usuário para os próximos middlewares/controllers

    next();
  } catch (err) {
    if (err.statusCode) return next(err);

    // Erros específicos do jwt.verify()
    if (err.name === 'TokenExpiredError') {
      const error = new Error('Token expirado');
      error.statusCode = 401;
      return next(error);
    }

    if (err.name === 'JsonWebTokenError') {
      const error = new Error('Token inválido');
      error.statusCode = 401;
      return next(error);
    }

    next(err);
  }
};

module.exports = authenticate;
