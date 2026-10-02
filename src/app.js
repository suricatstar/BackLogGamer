const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const backlogRoutes = require('./routes/backlog');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ─── Middlewares globais ───────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// ─── Rotas ────────────────────────────────────────────────────────────────────

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/backlog', backlogRoutes);

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
