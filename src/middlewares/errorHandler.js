/**
 * Middleware global de tratamento de erros.
 *
 * No Express, um middleware com 4 parâmetros (err, req, res, next)
 * é automaticamente reconhecido como error handler.
 * Deve ser registrado no app.js DEPOIS de todas as rotas.
 *
 * Por que centralizar aqui?
 * Para que todos os erros tenham o mesmo formato de resposta,
 * e não precisemos repetir lógica de tratamento em cada controller.
 */
const errorHandler = (err, req, res, next) => {
  // Log completo do erro no servidor (nunca enviar stack ao cliente em produção)
  console.error(`[ERROR] ${err.message}`, {
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // statusCode anexado no service, ou 500 como fallback
  const statusCode = err.statusCode || 500;

  const response = {
    error: {
      message: statusCode === 500 ? 'Erro interno do servidor' : err.message,
    },
  };

  // Em desenvolvimento, incluir o stack trace para facilitar debug
  if (process.env.NODE_ENV === 'development' && statusCode === 500) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
