"use strict";

const express = require("express");

// Constants
const PORT = 8000;

// App
const app = express();
app.get("/ping", (req, res) => {
  res.send("hello world");
});

app.listen(PORT, () => {});
