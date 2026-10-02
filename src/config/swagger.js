const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Configuração do Swagger/OpenAPI.
 *
 * swagger-jsdoc lê comentários JSDoc com @swagger nas rotas
 * e gera automaticamente o JSON da especificação OpenAPI.
 *
 * Por que documentar a API?
 * - Qualquer pessoa (ou frontend) consegue entender como consumir a API
 * - Permite testar endpoints diretamente no browser via Swagger UI
 * - É um critério de qualidade em entrevistas e projetos profissionais
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Game Backlog API',
      version: '1.0.0',
      description:
        'API REST para gerenciar seu backlog de jogos. Consome a RAWG Video Games API para dados de jogos.',
      contact: {
        name: 'Game Backlog API',
      },
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Servidor local de desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        /**
         * Define o esquema de autenticação Bearer JWT.
         * Depois de logar, o cliente envia:
         * Authorization: Bearer <accessToken>
         */
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'João Silva' },
            email: { type: 'string', example: 'joao@email.com' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            accessToken: { type: 'string', example: 'eyJhbGci...' },
            refreshToken: { type: 'string', example: 'eyJhbGci...' },
          },
        },
        BacklogItem: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            gameId: { type: 'number', example: 3498 },
            gameTitle: { type: 'string', example: 'Grand Theft Auto V' },
            gameCover: { type: 'string', nullable: true },
            status: {
              type: 'string',
              enum: ['BACKLOG', 'PLAYING', 'COMPLETED', 'DROPPED'],
            },
            priority: {
              type: 'string',
              enum: ['LOW', 'MEDIUM', 'HIGH'],
            },
            hoursPlayed: { type: 'number', example: 32 },
            rating: { type: 'number', nullable: true, example: 9 },
            notes: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'object',
              properties: {
                message: { type: 'string', example: 'Mensagem de erro' },
              },
            },
          },
        },
      },
    },
  },
  // Onde buscar as anotações @swagger — lê todos os arquivos de rotas
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
