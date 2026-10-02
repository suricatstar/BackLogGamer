const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { connect, clearDatabase, disconnect } = require('./setup/testDb');

/**
 * Testes de integração de autenticação.
 * Usa MongoDB Memory Server via helper testDb.js.
 */

// Precisamos setar as variáveis JWT antes de carregar o app
process.env.JWT_SECRET = 'test_secret_access';
process.env.JWT_REFRESH_SECRET = 'test_secret_refresh';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  // ─── POST /api/auth/register ─────────────────────────────────────────────────

  describe('POST /api/auth/register', () => {
    it('deve registrar um usuário e retornar 201 com tokens', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: 'João', email: 'joao@test.com', password: '123456' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user.email).toBe('joao@test.com');
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('deve retornar 409 se o email já estiver cadastrado', async () => {
      const userData = { name: 'João', email: 'joao@test.com', password: '123456' };

      await request(app).post('/api/auth/register').send(userData);
      const response = await request(app).post('/api/auth/register').send(userData);

      expect(response.status).toBe(409);
      expect(response.body.error.message).toMatch(/email já cadastrado/i);
    });
  });

  // ─── POST /api/auth/login ─────────────────────────────────────────────────────

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'João', email: 'joao@test.com', password: '123456' });
    });

    it('deve autenticar e retornar tokens', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'joao@test.com', password: '123456' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('deve retornar 401 para senha incorreta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'joao@test.com', password: 'senha-errada' });

      expect(response.status).toBe(401);
    });

    it('deve retornar 401 para email não cadastrado', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nao@existe.com', password: '123456' });

      expect(response.status).toBe(401);
    });

    it('não deve expor a senha no body da resposta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'joao@test.com', password: '123456' });

      expect(response.body.user).not.toHaveProperty('password');
    });
  });
});
