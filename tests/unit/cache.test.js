const { connectCache, getCache, setCache } = require('../../src/config/cache');

describe('Cache (fail-open)', () => {
  const original = process.env.REDIS_URL;

  afterAll(() => {
    if (original) process.env.REDIS_URL = original;
  });

  it('sem REDIS_URL, connectCache não lança e getCache retorna null', async () => {
    delete process.env.REDIS_URL;

    await expect(connectCache()).resolves.toBeUndefined();
    await expect(getCache('qualquer')).resolves.toBeNull();
  });

  it('setCache sem Redis ativo não lança', async () => {
    await expect(setCache('k', { a: 1 }, 10)).resolves.toBeUndefined();
  });
});
