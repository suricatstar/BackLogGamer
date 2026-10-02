const express = require("express");

const router = express.Router();

router.get('/status', (_req, res) => {

  res.json({
    status: 'ok',
    message: 'API está online!',
  });
});

module.exports = router;