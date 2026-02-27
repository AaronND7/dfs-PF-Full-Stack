// backend/src/routes/horarios.js
const express = require("express");
const pool = require("../db");
const router = express.Router();

function validateHorarioPayload(body) {
  const { clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin } = body;
  if (clase_id === undefined || profesor_id === undefined || alumno_id === undefined || !dia_semana || !hora_inicio || !hora_fin) {
    return "clase_id, profesor_id, alumno_id, dia_semana, hora_inicio y hora_fin son obligatorios";
  }
  if (hora_inicio >= hora_fin) return "hora_inicio debe ser menor que hora_fin";
  return null;
}

async function exists(table, id) {
  const { rows } = await pool.query(`SELECT 1 FROM ${table} WHERE id=$1`, [id]);
  return rows.length > 0;
}

// GET /
router.get("/", async (_, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM horarios ORDER BY id");
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /:id
router.get("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("SELECT * FROM horarios WHERE id=$1", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Horario no encontrado" });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// POST /
router.post("/", async (req, res, next) => {
  try {
    const errMsg = validateHorarioPayload(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin } = req.body;

    // check FK existence
    if (!await exists('clases', clase_id)) return res.status(400).json({ error: "clase_id no existe" });
    if (!await exists('profesores', profesor_id)) return res.status(400).json({ error: "profesor_id no existe" });
    if (!await exists('alumnos', alumno_id)) return res.status(400).json({ error: "alumno_id no existe" });

    const q = `INSERT INTO horarios (clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin)
               VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
    const values = [clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin];

    const { rows } = await pool.query(q, values);
    res.status(201).json(rows[0]);
  } catch (err) {
    // exclusion violation (overlap)
    if (err.code === '23P01') return res.status(409).json({ error: "Horario en conflicto (solapamiento)"} );
    if (err.code === '23503') return res.status(400).json({ error: "Clave foránea inválida" });
    next(err);
  }
});

// PUT /:id (reemplaza)
router.put("/:id", async (req, res, next) => {
  try {
    const errMsg = validateHorarioPayload(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin } = req.body;

    // check FK existence
    if (!await exists('clases', clase_id)) return res.status(400).json({ error: "clase_id no existe" });
    if (!await exists('profesores', profesor_id)) return res.status(400).json({ error: "profesor_id no existe" });
    if (!await exists('alumnos', alumno_id)) return res.status(400).json({ error: "alumno_id no existe" });

    const q = `UPDATE horarios SET clase_id=$1, profesor_id=$2, alumno_id=$3, dia_semana=$4, hora_inicio=$5, hora_fin=$6
               WHERE id=$7 RETURNING *`;
    const values = [clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin, req.params.id];
    const { rows } = await pool.query(q, values);
    if (!rows.length) return res.status(404).json({ error: "Horario no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23P01') return res.status(409).json({ error: "Horario en conflicto (solapamiento)"} );
    next(err);
  }
});

// PATCH /:id (parcial)
router.patch("/:id", async (req, res, next) => {
  try {
    // build update dynamically
    const allowed = ["clase_id","profesor_id","alumno_id","dia_semana","hora_inicio","hora_fin"];
    const fields = [];
    const vals = [];
    let idx = 1;
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        fields.push(`${k}=$${idx++}`);
        vals.push(req.body[k]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: "Nada que actualizar" });

    // If hours provided together or individually, do a sanity check:
    const hora_inicio = req.body.hora_inicio;
    const hora_fin = req.body.hora_fin;
    if ((hora_inicio !== undefined || hora_fin !== undefined) && (hora_inicio === undefined || hora_fin === undefined)) {
      // need both or read existing row for comparison
      const { rows: existing } = await pool.query("SELECT hora_inicio, hora_fin FROM horarios WHERE id=$1", [req.params.id]);
      if (!existing.length) return res.status(404).json({ error: "Horario no encontrado" });
      const hi = hora_inicio !== undefined ? hora_inicio : existing[0].hora_inicio;
      const hf = hora_fin !== undefined ? hora_fin : existing[0].hora_fin;
      if (hi >= hf) return res.status(400).json({ error: "hora_inicio debe ser menor que hora_fin" });
    } else if (hora_inicio !== undefined && hora_fin !== undefined) {
      if (hora_inicio >= hora_fin) return res.status(400).json({ error: "hora_inicio debe ser menor que hora_fin" });
    }

    vals.push(req.params.id);
    const q = `UPDATE horarios SET ${fields.join(", ")} WHERE id=$${idx} RETURNING *`;
    const { rows } = await pool.query(q, vals);
    if (!rows.length) return res.status(404).json({ error: "Horario no encontrado" });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23P01') return res.status(409).json({ error: "Horario en conflicto (solapamiento)"} );
    next(err);
  }
});

// DELETE /:id
router.delete("/:id", async (req, res, next) => {
  try {
    const { rows } = await pool.query("DELETE FROM horarios WHERE id=$1 RETURNING id", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Horario no encontrado" });
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;
