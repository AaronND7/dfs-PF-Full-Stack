// backend/src/models/Horario.js
const mongoose = require('mongoose');

const horarioSchema = new mongoose.Schema({
  clase_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Clase', required: true },
  profesor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profesor', required: true },
  alumno_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumno', required: true },
  dia_semana: { type: String, required: true },
  hora_inicio: { type: String, required: true },
  hora_fin: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Horario', horarioSchema);
