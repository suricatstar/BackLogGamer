const backlogService = require('../services/backlogService');

const getAll = async (req, res, next) => {
  try {
    const { status, priority, page, limit } = req.query;

    const result = await backlogService.getAll(req.user._id, {
      status,
      priority,
      page,
      limit,
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const item = await backlogService.getById(req.user._id, req.params.id);

    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

const add = async (req, res, next) => {
  try {
    const item = await backlogService.add(req.user._id, req.body);

    res.status(201).json(item);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const item = await backlogService.update(req.user._id, req.params.id, req.body);

    res.status(200).json(item);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await backlogService.remove(req.user._id, req.params.id);

    res.status(204).send(); // 204 No Content — deletado com sucesso, sem corpo
  } catch (error) {
    next(error);
  }
};

module.exports = { getAll, getById, add, update, remove };
