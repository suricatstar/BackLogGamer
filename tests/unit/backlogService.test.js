jest.mock('../../src/models/BacklogItem');

const BacklogItem = require('../../src/models/BacklogItem');
const backlogService = require('../../src/services/backlogService');

describe('BacklogService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('getAll', () => {
    it('deve filtrar por usuário/status e devolver paginação', async () => {
      const chain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ _id: '1' }]),
      };
      BacklogItem.find.mockReturnValue(chain);
      BacklogItem.countDocuments.mockResolvedValue(25);

      const result = await backlogService.getAll('u1', { status: 'PLAYING', page: 2, limit: 10 });

      expect(BacklogItem.find).toHaveBeenCalledWith({ user: 'u1', status: 'PLAYING' });
      expect(chain.skip).toHaveBeenCalledWith(10);
      expect(result.pagination).toEqual({ total: 25, page: 2, limit: 10, totalPages: 3 });
    });
  });

  describe('getById', () => {
    it('deve lançar 404 se o item não existir para o usuário', async () => {
      BacklogItem.findOne.mockResolvedValue(null);

      await expect(backlogService.getById('u1', 'i1')).rejects.toMatchObject({ statusCode: 404 });
      expect(BacklogItem.findOne).toHaveBeenCalledWith({ _id: 'i1', user: 'u1' });
    });
  });

  describe('add', () => {
    it('deve criar o item', async () => {
      BacklogItem.create.mockResolvedValue({ _id: 'i1', gameId: 1 });

      const result = await backlogService.add('u1', { gameId: 1, gameTitle: 'Jogo' });

      expect(result._id).toBe('i1');
      expect(BacklogItem.create).toHaveBeenCalledWith(expect.objectContaining({ user: 'u1', gameId: 1 }));
    });

    it('deve lançar 409 em chave duplicada', async () => {
      BacklogItem.create.mockRejectedValue({ code: 11000 });

      await expect(backlogService.add('u1', { gameId: 1 })).rejects.toMatchObject({ statusCode: 409 });
    });
  });

  describe('update', () => {
    it('deve ignorar campos não permitidos', async () => {
      BacklogItem.findOneAndUpdate.mockResolvedValue({ _id: 'i1' });

      await backlogService.update('u1', 'i1', { status: 'COMPLETED', user: 'hacker', gameId: 99 });

      expect(BacklogItem.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'i1', user: 'u1' },
        { $set: { status: 'COMPLETED' } },
        expect.any(Object)
      );
    });

    it('deve lançar 404 se não encontrar', async () => {
      BacklogItem.findOneAndUpdate.mockResolvedValue(null);

      await expect(backlogService.update('u1', 'i1', { status: 'DROPPED' })).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('remove', () => {
    it('deve lançar 404 se não encontrar', async () => {
      BacklogItem.findOneAndDelete.mockResolvedValue(null);

      await expect(backlogService.remove('u1', 'i1')).rejects.toMatchObject({ statusCode: 404 });
    });

    it('deve remover e retornar o item', async () => {
      BacklogItem.findOneAndDelete.mockResolvedValue({ _id: 'i1' });

      const result = await backlogService.remove('u1', 'i1');

      expect(result._id).toBe('i1');
    });
  });
});
