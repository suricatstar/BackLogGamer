const express = require('express');
const authenticate = require('../middlewares/authenticate');
const { getAll, getById, add, update, remove } = require('../controllers/backlogController');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Backlog
 *   description: Gerenciamento do backlog de jogos do usuário
 */

router.use(authenticate);

/**
 * @swagger
 * /api/backlog:
 *   get:
 *     summary: Lista todos os itens do backlog do usuário
 *     tags: [Backlog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [BACKLOG, PLAYING, COMPLETED, DROPPED]
 *         description: Filtra por status
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH]
 *         description: Filtra por prioridade
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Lista de itens com paginação
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BacklogItem'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total: { type: integer }
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     totalPages: { type: integer }
 *       401:
 *         description: Não autenticado
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/backlog:
 *   post:
 *     summary: Adiciona um jogo ao backlog
 *     tags: [Backlog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [gameId, gameTitle]
 *             properties:
 *               gameId:
 *                 type: number
 *                 example: 3498
 *               gameTitle:
 *                 type: string
 *                 example: Grand Theft Auto V
 *               gameCover:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [BACKLOG, PLAYING, COMPLETED, DROPPED]
 *                 default: BACKLOG
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *                 default: MEDIUM
 *               hoursPlayed:
 *                 type: number
 *                 default: 0
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *     responses:
 *       201:
 *         description: Jogo adicionado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BacklogItem'
 *       409:
 *         description: Jogo já está no backlog
 */
router.post('/', add);

/**
 * @swagger
 * /api/backlog/{id}:
 *   get:
 *     summary: Retorna um item específico do backlog
 *     tags: [Backlog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BacklogItem'
 *       404:
 *         description: Item não encontrado
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/backlog/{id}:
 *   patch:
 *     summary: Atualiza um item do backlog
 *     tags: [Backlog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [BACKLOG, PLAYING, COMPLETED, DROPPED]
 *               priority:
 *                 type: string
 *                 enum: [LOW, MEDIUM, HIGH]
 *               hoursPlayed:
 *                 type: number
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Item atualizado
 *       404:
 *         description: Item não encontrado
 */
router.patch('/:id', update);

/**
 * @swagger
 * /api/backlog/{id}:
 *   delete:
 *     summary: Remove um item do backlog
 *     tags: [Backlog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Item removido com sucesso
 *       404:
 *         description: Item não encontrado
 */
router.delete('/:id', remove);

module.exports = router;
