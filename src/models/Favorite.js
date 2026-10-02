const mongoose = require('mongoose');

/**
 * Schema de favorito.
 *
 * Por que entidade separada e não um array no User?
 * - Arrays no User crescem indefinidamente com o documento
 * - Não dá pra paginar arrays embutidos eficientemente
 * - Uma coleção separada é mais fácil de indexar e consultar
 * - Podemos adicionar campos (ex: nota, data) sem alterar o User
 *
 * Armazenamos gameTitle e gameCover localmente (denormalização)
 * para evitar chamar a RAWG toda vez que listamos favoritos.
 */
const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    gameId: {
      type: Number,
      required: [true, 'gameId é obrigatório'],
    },

    gameTitle: {
      type: String,
      required: [true, 'gameTitle é obrigatório'],
      trim: true,
    },

    gameCover: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Índice composto: um usuário não pode favoritar o mesmo jogo duas vezes.
 */
favoriteSchema.index({ user: 1, gameId: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
