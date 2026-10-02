const mongoose = require('mongoose');

/**
 * Schema de um item do backlog.
 *
 * Cada documento representa a relação entre UM usuário e UM jogo.
 * Os dados do jogo (nome, imagem, gênero) ficam na RAWG.
 * Aqui armazenamos apenas o que pertence ao usuário.
 *
 * Por que gameId é Number e não ObjectId?
 * Porque o ID vem da RAWG API, que usa inteiros.
 * Não é uma referência ao nosso banco — é uma chave estrangeira externa.
 */
const backlogItemSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // índice para acelerar queries "todos os itens do usuário X"
    },

    gameId: {
      type: Number,
      required: [true, 'gameId é obrigatório'],
    },

    /**
     * Título do jogo salvo localmente para exibição sem precisar
     * chamar a RAWG em toda leitura do backlog.
     * Denormalização intencional — trade-off entre consistência e performance.
     */
    gameTitle: {
      type: String,
      required: [true, 'gameTitle é obrigatório'],
      trim: true,
    },

    gameCover: {
      type: String, // URL da imagem de capa
      default: null,
    },

    status: {
      type: String,
      enum: {
        values: ['BACKLOG', 'PLAYING', 'COMPLETED', 'DROPPED'],
        message: 'Status inválido. Use: BACKLOG, PLAYING, COMPLETED ou DROPPED',
      },
      default: 'BACKLOG',
    },

    priority: {
      type: String,
      enum: {
        values: ['LOW', 'MEDIUM', 'HIGH'],
        message: 'Prioridade inválida. Use: LOW, MEDIUM ou HIGH',
      },
      default: 'MEDIUM',
    },

    hoursPlayed: {
      type: Number,
      default: 0,
      min: [0, 'hoursPlayed não pode ser negativo'],
    },

    rating: {
      type: Number,
      default: null,
      min: [1, 'Rating mínimo é 1'],
      max: [10, 'Rating máximo é 10'],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notas devem ter no máximo 1000 caracteres'],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Índice composto: garante que um usuário não adicione o mesmo jogo duas vezes.
 * unique: true no nível do índice — mais eficiente que validar no service.
 * O MongoDB retorna erro E11000 (duplicate key) se violar essa constraint.
 */
backlogItemSchema.index({ user: 1, gameId: 1 }, { unique: true });

const BacklogItem = mongoose.model('BacklogItem', backlogItemSchema);

module.exports = BacklogItem;
