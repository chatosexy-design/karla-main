const mongoose = require('mongoose');

// Esquema para los registros de comida
const logSchema = new mongoose.Schema({
  date: { type: String, required: true }, // 'YYYY-MM-DD'
  name: { type: String, required: true },
  grams: { type: Number, required: true },
  kcal: { type: Number, required: true },
  sugars: { type: Number, default: 0 },
  satfat: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);