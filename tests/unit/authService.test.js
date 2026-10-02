/**
 * Testes unitários do AuthService.
 *
 * "Unitário" significa: testamos UMA unidade isolada.
 * Mockamos tudo que é externo (banco, bcrypt, jwt).
 *
 * Padrão AAA:
 * Arrange  → prepara os dados e mocks
 * Act      → executa a função sendo testada
 * Assert   → verifica o resultado
 */

// Mock do model User — substituímos por um objeto fake
jest.mock('../../src/models/User');
jest.mock('jsonwebtoken');

const User = require('../../src/models/User');
const jwt = require('jsonwebtoken');
const authService = require('../../src/services/authService');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Variáveis de ambiente para os testes
    process.env.JWT_SECRET = 'test_secret';
    process.env.JWT_REFRESH_SECRET = 'test_refresh_secret';
    process.env.JWT_EXPIRES_IN = '15m';
    process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  });

  // ─── register ────────────────────────────────────────────────────────────────

  describe('register', () => {
    it('deve cadastrar um usuário e retornar tokens', async () => {
      // Arrange
      User.findOne.mockResolvedValue(null); // email não existe
      User.create.mockResolvedValue({
        _id: 'user-id-123',
        name: 'João',
        email: 'joao@test.com',
        createdAt: new Date(),
      });
      jwt.sign.mockReturnValue('mocked-token');

      // Act
      const result = await authService.register({
        name: 'João',
        email: 'joao@test.com',
        password: '123456',
      });

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('joao@test.com');
      expect(User.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar 409 se o email já estiver cadastrado', async () => {
      // Arrange
      User.findOne.mockResolvedValue({ email: 'joao@test.com' }); // email existe

      // Act & Assert
      await expect(
        authService.register({ name: 'João', email: 'joao@test.com', password: '123456' })
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Email já cadastrado',
      });

      expect(User.create).not.toHaveBeenCalled();
    });
  });

  // ─── login ───────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('deve autenticar e retornar tokens com credenciais válidas', async () => {
      // Arrange
      const mockUser = {
        _id: 'user-id-123',
        name: 'João',
        email: 'joao@test.com',
        comparePassword: jest.fn().mockResolvedValue(true), // senha correta
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });
      jwt.sign.mockReturnValue('mocked-token');

      // Act
      const result = await authService.login({
        email: 'joao@test.com',
        password: '123456',
      });

      // Assert
      expect(result).toHaveProperty('accessToken');
      expect(result.user.email).toBe('joao@test.com');
      expect(mockUser.comparePassword).toHaveBeenCalledWith('123456');
    });

    it('deve lançar 401 se o usuário não existir', async () => {
      // Arrange
      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null), // usuário não existe
      });

      // Act & Assert
      await expect(
        authService.login({ email: 'nao@existe.com', password: '123456' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('deve lançar 401 se a senha estiver incorreta', async () => {
      // Arrange
      const mockUser = {
        _id: 'user-id-123',
        email: 'joao@test.com',
        comparePassword: jest.fn().mockResolvedValue(false), // senha errada
      };

      User.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      // Act & Assert
      await expect(
        authService.login({ email: 'joao@test.com', password: 'senha-errada' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });
  });
});
