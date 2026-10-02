const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * AuthService — lógica de negócio de autenticação.
 *
 * Responsabilidade: orquestrar registro, login e geração de tokens.
 * NÃO lida com req/res (isso é trabalho do controller).
 * NÃO faz queries diretamente (usa o Model, que é nossa camada de dados aqui).
 *
 * Por que separar service de controller?
 * O controller traduz HTTP → dados → HTTP.
 * O service executa as regras do negócio.
 * Assim o service pode ser testado sem simular req/res.
 */

/**
 * Gera um access token JWT de curta duração.
 *
 * Por que curta duração? Se o token for roubado, ele expira rápido.
 * O cliente usa o refresh token para obter um novo sem precisar logar de novo.
 */
const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
};

/**
 * Gera um refresh token JWT de longa duração.
 *
 * Usa uma secret diferente do access token.
 * Por quê? Para que, mesmo que a JWT_SECRET vaze,
 * os refresh tokens continuem tendo segurança independente.
 */
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

/**
 * Registra um novo usuário.
 *
 * O hash da senha acontece no pre-save do User model,
 * então aqui simplesmente salvamos — sem bcrypt explícito.
 *
 * Por que lançar erro com statusCode?
 * O error middleware global vai capturar e usar esse código
 * para responder com o status HTTP correto.
 */
const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error('Email já cadastrado');
    error.statusCode = 409; // Conflict
    throw error;
  }

  const user = await User.create({ name, email, password });

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Autentica um usuário existente.
 *
 * Por que buscar com select('+password')?
 * O campo password tem select:false no schema,
 * então precisamos pedi-lo explicitamente quando formos compará-lo.
 */
const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    const error = new Error('Credenciais inválidas');
    error.statusCode = 401; // Unauthorized
    throw error;
  }

  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    const error = new Error('Credenciais inválidas');
    error.statusCode = 401;
    throw error;
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

/**
 * Gera um novo access token a partir de um refresh token válido.
 */
const refresh = async (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      const error = new Error('Usuário não encontrado');
      error.statusCode = 401;
      throw error;
    }

    const accessToken = generateAccessToken(user._id);

    return { accessToken };
  } catch (err) {
    if (err.statusCode) throw err;

    const error = new Error('Refresh token inválido ou expirado');
    error.statusCode = 401;
    throw error;
  }
};

module.exports = { register, login, refresh };
