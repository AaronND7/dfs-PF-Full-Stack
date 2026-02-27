// backend/src/routes/alumnos.js
const express = require("express");
const Alumno = require("../models/Alumno");
const router = express.Router();

function validateAlumno(body) {
  if (!body.nombre) return "nombre es obligatorio";
  if (body.edad !== undefined && (!Number.isInteger(body.edad) || body.edad < 0)) return "edad inválida";
  return null;
}

// GET /
router.get("/", async (_, res, next) => {
  try {
    const alumnos = await Alumno.find();
    res.json(alumnos);
  } catch (err) { next(err); }
});

// GET /:id
router.get("/:id", async (req, res, next) => {
  try {
    const alumno = await Alumno.findById(req.params.id);
    if (!alumno) return res.status(404).json({ error: "Alumno no encontrado" });
    res.json(alumno);
  } catch (err) { next(err); }
});

// POST /
router.post("/", async (req, res, next) => {
  try {
    const errMsg = validateAlumno(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { nombre, edad } = req.body;
    const nuevoAlumno = new Alumno({ nombre, edad });
    await nuevoAlumno.save();
    res.status(201).json(nuevoAlumno);
  } catch (err) { next(err); }
});

// PUT /:id
router.put("/:id", async (req, res, next) => {
  try {
    const errMsg = validateAlumno(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { nombre, edad } = req.body;
    const alumnoActualizado = await Alumno.findByIdAndUpdate(
      req.params.id,
      { nombre, edad },
      { new: true }
    );
    
    if (!alumnoActualizado) return res.status(404).json({ error: "Alumno no encontrado" });
    res.json(alumnoActualizado);
  } catch (err) { next(err); }
});

// DELETE /:id
router.delete("/:id", async (req, res, next) => {
  try {
    const alumnoEliminado = await Alumno.findByIdAndDelete(req.params.id);
    if (!alumnoEliminado) return res.status(404).json({ error: "Alumno no encontrado" });
    res.json(alumnoEliminado);
  } catch (err) { next(err); }
});

module.exports = router;
