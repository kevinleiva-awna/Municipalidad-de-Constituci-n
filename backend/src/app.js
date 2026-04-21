require('express-async-errors');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const eventosRoutes = require('./routes/eventos.routes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  exposedHeaders: ['X-Total-Count'],
}));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/eventos', eventosRoutes);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
