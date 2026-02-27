// backend/src/models/Alumno.js
const mongoose = require('mongoose');

const alumnoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  edad: { type: Number, required: true, min: 1 }
}, { timestamps: true });

module.exports = mongoose.model('Alumno', alumnoSchema);
