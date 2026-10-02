const express = require('express');
const authenticate = require('../middlewares/authenticate');
const { getAll, getById, add, update, remove } = require('../controllers/backlogController');

const router = express.Router();

/**
 * Todas as rotas de backlog exigem autenticação.
 * O middleware authenticate é aplicado uma vez para todo o router.
 */
router.use(authenticate);

router.get('/', getAll);
router.post('/', add);
router.get('/:id', getById);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
