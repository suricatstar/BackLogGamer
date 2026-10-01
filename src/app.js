const express = require("express");

const app = express();

app.get("/status", (req, res) => {
  res.json({
    status: "ok",
    message: "Hello World!",
  });
});

module.exports = app;
