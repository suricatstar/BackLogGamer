const authService = require('../services/authService');

/**
 * AuthController — camada HTTP.
 *
 * Responsabilidade: receber a requisição, extrair os dados,
 * chamar o service, e devolver a resposta HTTP correta.
 *
 * Não contém lógica de negócio. Não fala diretamente com o banco.
 * Se precisar de mais de ~10 linhas de lógica aqui, é sinal
 * de que algo deveria estar no service.
 */

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const result = await authService.register({ name, email, password });

    res.status(201).json(result);
  } catch (error) {
    next(error); // passa para o error middleware global
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login({ email, password });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    const result = await authService.refresh(refreshToken);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh };
