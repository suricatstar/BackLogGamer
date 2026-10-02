const BacklogItem = require('../models/BacklogItem');

/**
 * BacklogService — lógica de negócio do backlog.
 *
 * Todas as regras vivem aqui, não no controller.
 * O controller só sabe que "houve um erro" e repassa ao cliente.
 */

/**
 * Retorna todos os itens do backlog de um usuário.
 * Suporta filtro por status e paginação.
 */
const getAll = async (userId, { status, priority, page = 1, limit = 20 } = {}) => {
  const filter = { user: userId };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    BacklogItem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),

    BacklogItem.countDocuments(filter),
  ]);

  return {
    items,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Retorna um item específico do backlog, garantindo que pertence ao usuário.
 */
const getById = async (userId, itemId) => {
  const item = await BacklogItem.findOne({ _id: itemId, user: userId });

  if (!item) {
    const error = new Error('Item não encontrado');
    error.statusCode = 404;
    throw error;
  }

  return item;
};

/**
 * Adiciona um jogo ao backlog.
 *
 * Regra: um usuário não pode adicionar o mesmo gameId duas vezes.
 * O índice composto (user + gameId) garante isso no banco.
 * Mas capturamos o erro E11000 aqui para devolver uma mensagem clara.
 */
const add = async (userId, { gameId, gameTitle, gameCover, status, priority, hoursPlayed, rating, notes }) => {
  try {
    const item = await BacklogItem.create({
      user: userId,
      gameId,
      gameTitle,
      gameCover,
      status,
      priority,
      hoursPlayed,
      rating,
      notes,
    });

    return item;
  } catch (err) {
    // Erro de chave duplicada do MongoDB
    if (err.code === 11000) {
      const error = new Error('Este jogo já está no seu backlog');
      error.statusCode = 409;
      throw error;
    }

    throw err;
  }
};

/**
 * Atualiza campos de um item.
 * Somente o dono pode atualizar — garantido pelo filtro { user: userId }.
 */
const update = async (userId, itemId, fields) => {
  // Campos que o usuário pode alterar
  const allowed = ['status', 'priority', 'hoursPlayed', 'rating', 'notes'];
  const updates = {};

  for (const key of allowed) {
    if (fields[key] !== undefined) updates[key] = fields[key];
  }

  const item = await BacklogItem.findOneAndUpdate(
    { _id: itemId, user: userId },
    { $set: updates },
    {
      new: true,          // retorna o documento atualizado
      runValidators: true, // executa as validações do schema no update
    }
  );

  if (!item) {
    const error = new Error('Item não encontrado');
    error.statusCode = 404;
    throw error;
  }

  return item;
};

/**
 * Remove um item do backlog.
 * Somente o dono pode remover — garantido pelo filtro { user: userId }.
 */
const remove = async (userId, itemId) => {
  const item = await BacklogItem.findOneAndDelete({ _id: itemId, user: userId });

  if (!item) {
    const error = new Error('Item não encontrado');
    error.statusCode = 404;
    throw error;
  }

  return item;
};

module.exports = { getAll, getById, add, update, remove };
