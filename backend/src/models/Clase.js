// backend/src/models/Clase.js
const mongoose = require('mongoose');

const claseSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Clase', claseSchema);
