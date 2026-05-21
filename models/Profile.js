const mongoose = require('mongoose');

// Esquema para el perfil del usuario (datos generales)
const profileSchema = new mongoose.Schema({
  calTarget: { type: Number, default: 2000 },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);