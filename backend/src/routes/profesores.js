// backend/src/routes/profesores.js
const express = require("express");
const Profesor = require("../models/Profesor");
const router = express.Router();

function validateProfesor(body) {
  if (!body.nombre) return "nombre es obligatorio";
  return null;
}

// GET /
router.get("/", async (_, res, next) => {
  try {
    const profesores = await Profesor.find();
    res.json(profesores);
  } catch (err) { next(err); }
});

// GET /:id
router.get("/:id", async (req, res, next) => {
  try {
    const profesor = await Profesor.findById(req.params.id);
    if (!profesor) return res.status(404).json({ error: "Profesor no encontrado" });
    res.json(profesor);
  } catch (err) { next(err); }
});

// POST /
router.post("/", async (req, res, next) => {
  try {
    const errMsg = validateProfesor(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { nombre, especialidad } = req.body;
    const nuevoProfesor = new Profesor({ nombre, especialidad });
    await nuevoProfesor.save();
    res.status(201).json(nuevoProfesor);
  } catch (err) { next(err); }
});

// PUT /:id
router.put("/:id", async (req, res, next) => {
  try {
    const errMsg = validateProfesor(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { nombre, especialidad } = req.body;
    const profesorActualizado = await Profesor.findByIdAndUpdate(
      req.params.id,
      { nombre, especialidad },
      { new: true }
    );
    
    if (!profesorActualizado) return res.status(404).json({ error: "Profesor no encontrado" });
    res.json(profesorActualizado);
  } catch (err) { next(err); }
});

// DELETE /:id
router.delete("/:id", async (req, res, next) => {
  try {
    const profesorEliminado = await Profesor.findByIdAndDelete(req.params.id);
    if (!profesorEliminado) return res.status(404).json({ error: "Profesor no encontrado" });
    res.json(profesorEliminado);
  } catch (err) { next(err); }
});

module.exports = router;
