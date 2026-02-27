// backend/src/routes/horarios.js
const express = require("express");
const Horario = require('../models/Horario');
const Clase = require('../models/Clase');
const Profesor = require('../models/Profesor');
const Alumno = require('../models/Alumno');
const router = express.Router();

function validateHorarioPayload(body) {
  const { clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin } = body;
  if (clase_id === undefined || profesor_id === undefined || alumno_id === undefined || !dia_semana || !hora_inicio || !hora_fin) {
    return "clase_id, profesor_id, alumno_id, dia_semana, hora_inicio y hora_fin son obligatorios";
  }
  if (hora_inicio >= hora_fin) return "hora_inicio debe ser menor que hora_fin";
  return null;
}

// GET /
router.get("/", async (_, res, next) => {
  try {
    const horarios = await Horario.find()
      .populate('clase_id')
      .populate('profesor_id')
      .populate('alumno_id');
    res.json(horarios);
  } catch (err) { next(err); }
});

// GET /:id
router.get("/:id", async (req, res, next) => {
  try {
    const horario = await Horario.findById(req.params.id)
      .populate('clase_id')
      .populate('profesor_id')
      .populate('alumno_id');
    if (!horario) return res.status(404).json({ error: "Horario no encontrado" });
    res.json(horario);
  } catch (err) { next(err); }
});

// POST /
router.post("/", async (req, res, next) => {
  try {
    const errMsg = validateHorarioPayload(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin } = req.body;

    // Verificar existencia de FKs
    const [clase, profesor, alumno] = await Promise.all([
      Clase.findById(clase_id),
      Profesor.findById(profesor_id),
      Alumno.findById(alumno_id)
    ]);
    
    if (!clase) return res.status(400).json({ error: "clase_id no existe" });
    if (!profesor) return res.status(400).json({ error: "profesor_id no existe" });
    if (!alumno) return res.status(400).json({ error: "alumno_id no existe" });

    // Validación de conflictos
    const existingHorario = await Horario.findOne({
      $or: [
        { profesor_id, dia_semana, hora_inicio },
        { alumno_id, dia_semana, hora_inicio }
      ]
    });
    
    if (existingHorario) {
      return res.status(409).json({ error: "Conflicto de horario detectado" });
    }

    const nuevoHorario = new Horario({
      clase_id,
      profesor_id,
      alumno_id,
      dia_semana,
      hora_inicio,
      hora_fin
    });
    
    await nuevoHorario.save();
    res.status(201).json(nuevoHorario);
    
  } catch (err) { next(err); }
});

// PUT /:id
router.put("/:id", async (req, res, next) => {
  try {
    const errMsg = validateHorarioPayload(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin } = req.body;

    // Verificar existencia de FKs
    const [clase, profesor, alumno] = await Promise.all([
      Clase.findById(clase_id),
      Profesor.findById(profesor_id),
      Alumno.findById(alumno_id)
    ]);
    
    if (!clase) return res.status(400).json({ error: "clase_id no existe" });
    if (!profesor) return res.status(400).json({ error: "profesor_id no existe" });
    if (!alumno) return res.status(400).json({ error: "alumno_id no existe" });

    // Validación de conflictos (excluyendo el registro actual)
    const existingHorario = await Horario.findOne({
      _id: { $ne: req.params.id },
      $or: [
        { profesor_id, dia_semana, hora_inicio },
        { alumno_id, dia_semana, hora_inicio }
      ]
    });
    
    if (existingHorario) {
      return res.status(409).json({ error: "Conflicto de horario detectado" });
    }

    const horarioActualizado = await Horario.findByIdAndUpdate(
      req.params.id,
      { clase_id, profesor_id, alumno_id, dia_semana, hora_inicio, hora_fin },
      { new: true }
    ).populate('clase_id').populate('profesor_id').populate('alumno_id');
    
    if (!horarioActualizado) return res.status(404).json({ error: "Horario no encontrado" });
    res.json(horarioActualizado);
    
  } catch (err) { next(err); }
});

// DELETE /:id
router.delete("/:id", async (req, res, next) => {
  try {
    const horarioEliminado = await Horario.findByIdAndDelete(req.params.id);
    if (!horarioEliminado) return res.status(404).json({ error: "Horario no encontrado" });
    res.json(horarioEliminado);
  } catch (err) { next(err); }
});

module.exports = router;
