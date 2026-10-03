jest.mock('../../src/models/Favorite');
jest.mock('../../src/integrations/rawg/rawgIntegration');

const Favorite = require('../../src/models/Favorite');
const rawg = require('../../src/integrations/rawg/rawgIntegration');
const favoriteService = require('../../src/services/favoriteService');

describe('FavoriteService', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('addFavorite', () => {
    it('deve buscar o jogo na RAWG e salvar o favorito', async () => {
      rawg.getGameById.mockResolvedValue({ id: 3498, name: 'GTA V', background_image: 'img.jpg' });
      Favorite.create.mockResolvedValue({ gameId: 3498 });

      const result = await favoriteService.addFavorite('u1', 3498);

      expect(Favorite.create).toHaveBeenCalledWith({
        user: 'u1',
        gameId: 3498,
        gameTitle: 'GTA V',
        gameCover: 'img.jpg',
      });
      expect(result.gameId).toBe(3498);
    });

    it('deve lançar 409 se já for favorito', async () => {
      rawg.getGameById.mockResolvedValue({ id: 1, name: 'X' });
      Favorite.create.mockRejectedValue({ code: 11000 });

      await expect(favoriteService.addFavorite('u1', 1)).rejects.toMatchObject({ statusCode: 409 });
    });

    it('não deve salvar se a RAWG falhar', async () => {
      rawg.getGameById.mockRejectedValue(Object.assign(new Error('x'), { statusCode: 404 }));

      await expect(favoriteService.addFavorite('u1', 999)).rejects.toMatchObject({ statusCode: 404 });
      expect(Favorite.create).not.toHaveBeenCalled();
    });
  });

  describe('removeFavorite', () => {
    it('deve lançar 404 se não existir', async () => {
      Favorite.findOneAndDelete.mockResolvedValue(null);

      await expect(favoriteService.removeFavorite('u1', 1)).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('isFavorited', () => {
    it('deve retornar true/false conforme existência', async () => {
      Favorite.findOne.mockResolvedValueOnce({ _id: 'f' }).mockResolvedValueOnce(null);

      expect(await favoriteService.isFavorited('u1', 1)).toEqual({ favorited: true });
      expect(await favoriteService.isFavorited('u1', 2)).toEqual({ favorited: false });
    });
  });
});
