const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../src/app');
const { connect, clearDatabase, disconnect } = require('./setup/testDb');

process.env.JWT_SECRET = 'test_secret_access';
process.env.JWT_REFRESH_SECRET = 'test_secret_refresh';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

describe('Backlog Integration Tests', () => {
  let token;
  let authHeader;

  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await disconnect();
  });

  const loginAsTestUser = async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test', email: 'test@test.com', password: '123456' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: '123456' });

    token = res.body.accessToken;
    authHeader = { Authorization: `Bearer ${token}` };
  };

  const sampleGame = {
    gameId: 3498,
    gameTitle: 'Grand Theft Auto V',
    status: 'BACKLOG',
  };

  // ─── POST /api/backlog ────────────────────────────────────────────────────────

  describe('POST /api/backlog', () => {
    beforeEach(loginAsTestUser);

    it('deve adicionar um jogo ao backlog e retornar 201', async () => {
      const response = await request(app)
        .post('/api/backlog')
        .set(authHeader)
        .send(sampleGame);

      expect(response.status).toBe(201);
      expect(response.body.gameId).toBe(sampleGame.gameId);
      expect(response.body.status).toBe('BACKLOG');
    });

    it('deve retornar 409 ao adicionar o mesmo jogo duas vezes', async () => {
      await request(app).post('/api/backlog').set(authHeader).send(sampleGame);

      const response = await request(app)
        .post('/api/backlog')
        .set(authHeader)
        .send(sampleGame);

      expect(response.status).toBe(409);
    });

    it('deve retornar 401 sem autenticação', async () => {
      const response = await request(app).post('/api/backlog').send(sampleGame);
      expect(response.status).toBe(401);
    });
  });

  // ─── GET /api/backlog ─────────────────────────────────────────────────────────

  describe('GET /api/backlog', () => {
    beforeEach(async () => {
      await loginAsTestUser();
      await request(app).post('/api/backlog').set(authHeader).send(sampleGame);
    });

    it('deve retornar os itens com paginação', async () => {
      const response = await request(app).get('/api/backlog').set(authHeader);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.items.length).toBe(1);
      expect(response.body.pagination.total).toBe(1);
    });

    it('deve retornar 401 sem token', async () => {
      const response = await request(app).get('/api/backlog');
      expect(response.status).toBe(401);
    });
  });

  // ─── PATCH /api/backlog/:id ───────────────────────────────────────────────────

  describe('PATCH /api/backlog/:id', () => {
    let itemId;

    beforeEach(async () => {
      await loginAsTestUser();
      const res = await request(app)
        .post('/api/backlog')
        .set(authHeader)
        .send(sampleGame);
      itemId = res.body._id;
    });

    it('deve atualizar o status e hoursPlayed', async () => {
      const response = await request(app)
        .patch(`/api/backlog/${itemId}`)
        .set(authHeader)
        .send({ status: 'PLAYING', hoursPlayed: 10 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('PLAYING');
      expect(response.body.hoursPlayed).toBe(10);
    });
  });

  // ─── DELETE /api/backlog/:id ──────────────────────────────────────────────────

  describe('DELETE /api/backlog/:id', () => {
    let itemId;

    beforeEach(async () => {
      await loginAsTestUser();
      const res = await request(app)
        .post('/api/backlog')
        .set(authHeader)
        .send(sampleGame);
      itemId = res.body._id;
    });

    it('deve deletar o item e retornar 204', async () => {
      const response = await request(app)
        .delete(`/api/backlog/${itemId}`)
        .set(authHeader);

      expect(response.status).toBe(204);
    });

    it('deve retornar 404 para item inexistente', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .delete(`/api/backlog/${fakeId}`)
        .set(authHeader);

      expect(response.status).toBe(404);
    });
  });
});
