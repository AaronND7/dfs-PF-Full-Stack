// backend/src/routes/profesores.js
const express = require("express");
const pool = require("../db");
const router = express.Router();

function validateProfesor(body) {
  if (!body.nombre) return "nombre es obligatorio";
  return null;
}

// GET /
router.get("/", async (_, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM profesores ORDER BY id");
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /:id
router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM profesores WHERE id=$1", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Profesor no encontrado" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /
router.post("/", async (req, res, next) => {
  try {
    const errMsg = validateProfesor(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });
    const { nombre, especialidad } = req.body;
    const q = "INSERT INTO profesores (nombre, especialidad) VALUES ($1,$2) RETURNING *";
    const { rows } = await pool.query(q, [nombre, especialidad]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /:id
router.put("/:id", async (req, res, next) => {
  try {
    const errMsg = validateProfesor(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });
    const { nombre, especialidad } = req.body;
    const q = "UPDATE profesores SET nombre=$1, especialidad=$2 WHERE id=$3 RETURNING *";
    const { rows } = await pool.query(q, [nombre, especialidad, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Profesor no encontrado" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /:id
router.patch("/:id", async (req, res, next) => {
  try {
    const fields = [];
    const vals = [];
    let idx = 1;
    for (const key of ["nombre", "especialidad"]) {
      if (req.body[key] !== undefined) {
        fields.push(`${key}=$${idx++}`);
        vals.push(req.body[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: "Nada que actualizar" });
    vals.push(req.params.id);
    const q = `UPDATE profesores SET ${fields.join(", ")} WHERE id=$${idx} RETURNING *`;
    const { rows } = await pool.query(q, vals);
    if (!rows.length) return res.status(404).json({ error: "Profesor no encontrado" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("DELETE FROM profesores WHERE id=$1 RETURNING id", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Profesor no encontrado" });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
