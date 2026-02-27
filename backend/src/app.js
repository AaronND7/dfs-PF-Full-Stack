// backend/src/app.js
const express = require("express");
const cors = require("cors");

// Configurar Google DNS antes de conectar a MongoDB
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = require("./db"); // NUEVO: Conexión a MongoDB

// Conectar a MongoDB Atlas
connectDB(); // NUEVO

const usuarios = require("./routes/usuarios");
const profesores = require("./routes/profesores");
const alumnos = require("./routes/alumnos");
const clases = require("./routes/clases");
const horarios = require("./routes/horarios");
const auth = require("./routes/auth");
const weather = require("./routes/weather");

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => res.json({ status: "API running 🎵" }));

// Debug route para verificar rutas disponibles
app.get("/debug/routes", (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    }
  });
  res.json({ routes });
});

app.use("/usuarios", usuarios);
app.use("/profesores", profesores);
app.use("/alumnos", alumnos);
app.use("/clases", clases);
app.use("/horarios", horarios);
app.use("/auth", auth);
app.use("/weather", weather);

// error handler simple
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal server error" });
});

module.exports = app;
