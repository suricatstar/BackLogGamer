const BacklogItem = require('../models/BacklogItem');

/**
 * StatsService — calcula métricas do backlog do usuário.
 *
 * Por que usar aggregate e não várias queries separadas?
 * aggregate faz tudo em uma única viagem ao banco.
 * Múltiplos find() separados gerariam N roundtrips — menos eficiente.
 *
 * O pipeline de agregação funciona como um "pipeline de transformação":
 * cada estágio recebe os documentos do anterior e os transforma.
 */
const getUserStats = async (userId) => {
  /**
   * Pipeline de agregação:
   *
   * 1. $match   → filtra só os itens do usuário
   * 2. $group   → agrupa TUDO em um único documento calculando os totais
   * 3. $project → formata o resultado final
   */
  const [stats] = await BacklogItem.aggregate([
    {
      $match: { user: userId },
    },
    {
      $group: {
        _id: null, // null = agrupa todos os documentos num único resultado

        totalGames: { $sum: 1 },

        // Conta cada status usando $cond (if/then/else dentro do aggregate)
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
        },
        playing: {
          $sum: { $cond: [{ $eq: ['$status', 'PLAYING'] }, 1, 0] },
        },
        backlog: {
          $sum: { $cond: [{ $eq: ['$status', 'BACKLOG'] }, 1, 0] },
        },
        dropped: {
          $sum: { $cond: [{ $eq: ['$status', 'DROPPED'] }, 1, 0] },
        },

        totalHoursPlayed: { $sum: '$hoursPlayed' },

        // Média apenas dos itens que têm rating definido
        averageRating: {
          $avg: {
            $cond: [{ $ne: ['$rating', null] }, '$rating', '$$REMOVE'],
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalGames: 1,
        completed: 1,
        playing: 1,
        backlog: 1,
        dropped: 1,
        totalHoursPlayed: 1,

        // Taxa de conclusão: completed / totalGames * 100 (arredondada)
        completionRate: {
          $round: [
            {
              $multiply: [
                { $divide: ['$completed', { $max: ['$totalGames', 1] }] },
                100,
              ],
            },
            1, // 1 casa decimal
          ],
        },

        averageRating: { $round: ['$averageRating', 1] },
      },
    },
  ]);

  // Se o usuário não tiver nenhum item, retorna zeros
  if (!stats) {
    return {
      totalGames: 0,
      completed: 0,
      playing: 0,
      backlog: 0,
      dropped: 0,
      totalHoursPlayed: 0,
      completionRate: 0,
      averageRating: null,
    };
  }

  return stats;
};

module.exports = { getUserStats };
