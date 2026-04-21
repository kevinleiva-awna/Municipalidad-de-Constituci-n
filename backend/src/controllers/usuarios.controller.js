const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');

const PUBLIC_SELECT = {
  id: true,
  nombre: true,
  email: true,
  rol: true,
  activo: true,
  createdAt: true,
};

const ROLES_VALIDOS = ['ADMIN', 'FUNCIONARIO', 'CIUDADANO'];

function generarPassword(len = 12) {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += alfabeto[Math.floor(Math.random() * alfabeto.length)];
  }
  return out;
}

async function listar(req, res) {
  const usuarios = await prisma.user.findMany({
    select: PUBLIC_SELECT,
    orderBy: { id: 'asc' },
  });
  return res.json({ usuarios });
}

async function crearFuncionario(req, res) {
  const { nombre, email, rol } = req.body || {};
  if (!nombre || !email) {
    return res.status(400).json({ error: 'nombre y email son obligatorios' });
  }
  const rolFinal = rol && ROLES_VALIDOS.includes(rol) ? rol : 'FUNCIONARIO';

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
  }

  const passwordTemporal = generarPassword(12);
  const passwordHash = await bcrypt.hash(passwordTemporal, 10);

  const user = await prisma.user.create({
    data: { nombre, email, rol: rolFinal, passwordHash, activo: true },
    select: PUBLIC_SELECT,
  });

  return res.status(201).json({ user, passwordTemporal });
}

async function cambiarRol(req, res) {
  const id = parseInt(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

  const { rol } = req.body || {};
  if (!ROLES_VALIDOS.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  if (req.user.id === id && rol !== 'ADMIN') {
    return res.status(400).json({ error: 'No puedes quitarte tu propio rol ADMIN' });
  }

  const actual = await prisma.user.findUnique({ where: { id } });
  if (!actual) return res.status(404).json({ error: 'Usuario no encontrado' });

  const user = await prisma.user.update({
    where: { id },
    data: { rol },
    select: PUBLIC_SELECT,
  });
  return res.json({ user });
}

async function desactivar(req, res) {
  const id = parseInt(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

  if (req.user.id === id) {
    return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
  }

  const actual = await prisma.user.findUnique({ where: { id } });
  if (!actual) return res.status(404).json({ error: 'Usuario no encontrado' });

  const user = await prisma.user.update({
    where: { id },
    data: { activo: false },
    select: PUBLIC_SELECT,
  });
  return res.json({ user });
}

async function reactivar(req, res) {
  const id = parseInt(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

  const actual = await prisma.user.findUnique({ where: { id } });
  if (!actual) return res.status(404).json({ error: 'Usuario no encontrado' });

  const user = await prisma.user.update({
    where: { id },
    data: { activo: true },
    select: PUBLIC_SELECT,
  });
  return res.json({ user });
}

module.exports = { listar, crearFuncionario, cambiarRol, desactivar, reactivar };
