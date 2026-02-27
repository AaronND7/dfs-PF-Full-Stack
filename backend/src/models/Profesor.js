// backend/src/models/Profesor.js
const mongoose = require('mongoose');

const profesorSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  especialidad: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Profesor', profesorSchema);
