const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(user) {
  return { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol };
}

async function register(req, res) {
  const { nombre, email, password } = req.body || {};
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'nombre, email y password son obligatorios' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { nombre, email, passwordHash, rol: 'CIUDADANO' },
  });

  const token = signToken(user);
  return res.status(201).json({ token, user: publicUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email y password son obligatorios' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.activo) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const token = signToken(user);
  return res.json({ token, user: publicUser(user) });
}

async function me(req, res) {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
  return res.json({ user: publicUser(user) });
}

async function updateMe(req, res) {
  const { nombre, password, passwordActual } = req.body || {};
  const updates = {};

  if (nombre !== undefined) {
    if (!nombre.trim()) {
      return res.status(400).json({ error: 'El nombre no puede estar vacío' });
    }
    updates.nombre = nombre.trim();
  }

  if (password) {
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (!passwordActual) {
      return res.status(400).json({ error: 'Debes ingresar tu contraseña actual' });
    }
    const actual = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!actual) return res.status(404).json({ error: 'Usuario no encontrado' });
    const ok = await bcrypt.compare(passwordActual, actual.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: 'La contraseña actual es incorrecta' });
    }
    updates.passwordHash = await bcrypt.hash(password, 10);
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No hay cambios para guardar' });
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: updates,
  });

  return res.json({ user: publicUser(user) });
}

module.exports = { register, login, me, updateMe };
