// backend/src/routes/usuarios.js
const express = require("express");
const pool = require("../db");

const router = express.Router();
const VALID_ROLES = ["admin", "profesor", "alumno"];

function validateUsuarioPayload(body) {
  const { nombre, email, password, rol } = body;
  if (!nombre || !email || !password || !rol) return "nombre, email, password y rol son obligatorios";
  if (!VALID_ROLES.includes(rol)) return `rol inválido. Debe ser una de: ${VALID_ROLES.join(", ")}`;
  return null;
}

// GET /usuarios
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT id, nombre, email, rol FROM usuarios ORDER BY id");
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /usuarios/:id
router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT id, nombre, email, rol FROM usuarios WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /usuarios
router.post("/", async (req, res, next) => {
  try {
    const errMsg = validateUsuarioPayload(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { nombre, email, password, rol } = req.body;
    const q = `INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1,$2,$3,$4) RETURNING id, nombre, email, rol`;
    const { rows } = await pool.query(q, [nombre, email, password, rol]);
    res.status(201).json(rows[0]);
  } catch (err) {
    // unique email violation
    if (err.code === "23505") return res.status(409).json({ error: "Email ya registrado" });
    next(err);
  }
});

// PUT /usuarios/:id  (reemplaza)
router.put("/:id", async (req, res, next) => {
  try {
    const errMsg = validateUsuarioPayload(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { nombre, email, password, rol } = req.body;
    const q = `UPDATE usuarios SET nombre=$1, email=$2, password=$3, rol=$4 WHERE id=$5 RETURNING id, nombre, email, rol`;
    const { rows } = await pool.query(q, [nombre, email, password, rol, req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Email ya registrado" });
    next(err);
  }
});

// PATCH /usuarios/:id (modifica parcialmente)
router.patch("/:id", async (req, res, next) => {
  try {
    const fields = [];
    const vals = [];
    let idx = 1;
    for (const key of ["nombre", "email", "password", "rol"]) {
      if (req.body[key] !== undefined) {
        if (key === "rol" && !VALID_ROLES.includes(req.body[key])) {
          return res.status(400).json({ error: `rol inválido. Debe ser una de: ${VALID_ROLES.join(", ")}` });
        }
        fields.push(`${key}=$${idx++}`);
        vals.push(req.body[key]);
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: "Nada que actualizar" });
    vals.push(req.params.id);
    const q = `UPDATE usuarios SET ${fields.join(", ")} WHERE id=$${idx} RETURNING id, nombre, email, rol`;
    const { rows } = await pool.query(q, vals);
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "Email ya registrado" });
    next(err);
  }
});

// DELETE /usuarios/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("DELETE FROM usuarios WHERE id=$1 RETURNING id", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
