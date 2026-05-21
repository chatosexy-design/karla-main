require('dotenv').config(); // Cargar variables de entorno del archivo .env
const path = require('path');
const express = require('express');
const compression = require('compression');
const mongoose = require('mongoose');

// Importar modelos de datos
const Log = require('./models/Log');
const Profile = require('./models/Profile');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración de conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

app.disable('x-powered-by');
app.use(compression());
app.use(express.json()); // Middleware para procesar JSON en peticiones POST/PUT

// CSP y cabeceras de seguridad
app.use((req,res,next)=>{
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com 'self'; img-src 'self' data:;");
  next();
});

// --- API ROUTES ---

// Obtener todos los registros de comida
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ date: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener registros' });
  }
});

// Guardar un nuevo registro de comida
app.post('/api/logs', async (req, res) => {
  try {
    const newLog = new Log(req.body);
    await newLog.save();
    res.status(201).json(newLog);
  } catch (err) {
    res.status(400).json({ error: 'Error al guardar el registro' });
  }
});

// Borrar un registro de comida
app.delete('/api/logs/:id', async (req, res) => {
  try {
    await Log.findByIdAndDelete(req.params.id);
    res.json({ message: 'Registro eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el registro' });
  }
});

// Obtener o crear perfil de usuario (datos generales)
app.get('/api/profile', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create({ calTarget: 2000 });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
});

// Actualizar perfil de usuario
app.post('/api/profile', async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(profile);
  } catch (err) {
    res.status(400).json({ error: 'Error al actualizar perfil' });
  }
});

// --- STATIC FILES ---

app.use(express.static(path.join(__dirname), {
  extensions: ['html'],
  maxAge: '1h',
  setHeaders(res, filePath){
    if(filePath.endsWith('index.html')){
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar el servidor solo si no estamos en un entorno serverless (como Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 NUTRIRUTA escuchando en http://localhost:${PORT}`);
  });
}

// Exportar la app para Vercel
module.exports = app;