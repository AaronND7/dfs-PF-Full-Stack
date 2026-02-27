// backend/src/app.js
const express = require("express");
const cors = require("cors");

const usuarios = require("./routes/usuarios");
const profesores = require("./routes/profesores");
const alumnos = require("./routes/alumnos");
const clases = require("./routes/clases");
const horarios = require("./routes/horarios");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "API running 🎵" }));

app.use("/usuarios", usuarios);
app.use("/profesores", profesores);
app.use("/alumnos", alumnos);
app.use("/clases", clases);
app.use("/horarios", horarios);

// error handler simple
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

module.exports = app;
