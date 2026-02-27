// backend/src/routes/clases.js
const express = require("express");
const Clase = require("../models/Clase");
const router = express.Router();

function validateClase(body) {
  if (!body.nombre) return "nombre es obligatorio";
  return null;
}

// GET /
router.get("/", async (_, res, next) => {
  try {
    const clases = await Clase.find();
    res.json(clases);
  } catch (err) { next(err); }
});

// GET /:id
router.get("/:id", async (req, res, next) => {
  try {
    const clase = await Clase.findById(req.params.id);
    if (!clase) return res.status(404).json({ error: "Clase no encontrada" });
    res.json(clase);
  } catch (err) { next(err); }
});

// POST /
router.post("/", async (req, res, next) => {
  try {
    const errMsg = validateClase(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { nombre, descripcion } = req.body;
    const nuevaClase = new Clase({ nombre, descripcion });
    await nuevaClase.save();
    res.status(201).json(nuevaClase);
  } catch (err) { next(err); }
});

// PUT /:id
router.put("/:id", async (req, res, next) => {
  try {
    const errMsg = validateClase(req.body);
    if (errMsg) return res.status(400).json({ error: errMsg });

    const { nombre, descripcion } = req.body;
    const claseActualizada = await Clase.findByIdAndUpdate(
      req.params.id,
      { nombre, descripcion },
      { new: true }
    );
    
    if (!claseActualizada) return res.status(404).json({ error: "Clase no encontrada" });
    res.json(claseActualizada);
  } catch (err) { next(err); }
});

// DELETE /:id
router.delete("/:id", async (req, res, next) => {
  try {
    const claseEliminada = await Clase.findByIdAndDelete(req.params.id);
    if (!claseEliminada) return res.status(404).json({ error: "Clase no encontrada" });
    res.json(claseEliminada);
  } catch (err) { next(err); }
});

module.exports = router;
