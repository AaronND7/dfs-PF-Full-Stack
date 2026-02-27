// backend/src/routes/alumnos.js
const express = require("express");
const pool = require("../db");
const router = express.Router();

function validateAlumno(body) {
  if (!body.nombre) return "nombre es obligatorio";
  if (body.edad !== undefined && (!Number.isInteger(body.edad) || body.edad < 0)) return "edad inválida";
  return null;
}

// GET /
router.get("/", async (_, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM alumnos ORDER BY id");
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /:id
router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM alumnos WHERE id=$1", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Alumno no encontrado" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /
router.post("/", async (req, res, next) => {
  try {
    const errMsg = validateAlumno(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });
    const { nombre, edad } = req.body;
    const q = "INSERT INTO alumnos (nombre, edad) VALUES ($1,$2) RETURNING *";
    const { rows } = await pool.query(q, [nombre, edad]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /:id
router.put("/:id", async (req, res, next) => {
  try {
    const errMsg = validateAlumno(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });
    const { nombre, edad } = req.body;
    const q = "UPDATE alumnos SET nombre=$1, edad=$2 WHERE id=$3 RETURNING *";
    const { rows } = await pool.query(q, [nombre, edad, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Alumno no encontrado" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// PATCH /:id
router.patch("/:id", async (req, res, next) => {
  try {
    const fields = [];
    const vals = [];
    let idx = 1;
    for (const key of ["nombre", "edad"]) {
      if (req.body[key] !== undefined) {
        fields.push(`${key}=$${idx++}`);
        vals.push(req.body[key]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: "Nada que actualizar" });
    vals.push(req.params.id);
    const q = `UPDATE alumnos SET ${fields.join(", ")} WHERE id=$${idx} RETURNING *`;
    const { rows } = await pool.query(q, vals);
    if (!rows.length) return res.status(404).json({ error: "Alumno no encontrado" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("DELETE FROM alumnos WHERE id=$1 RETURNING id", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Alumno no encontrado" });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
