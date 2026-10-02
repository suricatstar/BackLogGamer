const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const backlogRoutes = require('./routes/backlog');
const gameRoutes = require('./routes/games');
const favoriteRoutes = require('./routes/favorites');
const meRoutes = require('./routes/me');
const errorHandler = require('./middlewares/errorHandler');
const { generalLimiter, authLimiter } = require('./middlewares/rateLimiter');

const app = express();

// ─── Segurança ─────────────────────────────────────────────────────────────────

/**
 * helmet() adiciona ~15 headers de segurança HTTP automaticamente.
 *
 * Exemplos do que ele faz:
 * - X-Content-Type-Options: nosniff  → previne MIME sniffing
 * - X-Frame-Options: DENY            → previne clickjacking (iframes)
 * - Strict-Transport-Security        → força HTTPS em produção
 * - Content-Security-Policy          → restringe origens de scripts/imagens
 *
 * É literalmente uma linha que resolve dezenas de vulnerabilidades comuns.
 */
app.use(helmet());

/**
 * CORS — controla quais origens podem acessar a API.
 * Em produção, substituir por: cors({ origin: 'https://seusite.com' })
 */
app.use(cors());

app.use(express.json());

/**
 * Rate limit geral — aplicado em toda a API antes das rotas.
 * 100 req / 15 min por IP.
 */
app.use('/api', generalLimiter);

// ─── Rotas ────────────────────────────────────────────────────────────────────

app.use('/api', healthRoutes);

/**
 * Rate limit específico para auth — 10 req / 15 min por IP.
 * Aplicado ANTES do router de auth para proteger login e register.
 */
app.use('/api/auth', authLimiter, authRoutes);

app.use('/api/backlog', backlogRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/me', meRoutes);

// ─── Documentação Swagger ─────────────────────────────────────────────────────

/**
 * GET /api-docs
 * Interface visual interativa para explorar e testar todos os endpoints.
 * Acesse no browser: http://localhost:3001/api-docs
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── 404 — rota não encontrada ─────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: { message: 'Rota não encontrada' } });
});

// ─── Error handler global (deve ser o último middleware) ──────────────────────

/**
 * Por que o errorHandler deve vir depois de todas as rotas?
 * O Express executa middlewares em ordem de registro.
 * Se vier antes das rotas, nunca será acionado pelos erros delas.
 */
app.use(errorHandler);

module.exports = app;
