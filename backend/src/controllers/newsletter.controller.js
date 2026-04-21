const { format } = require('@fast-csv/format');
const prisma = require('../utils/prisma');

const PUBLIC_SELECT = { id: true, nombre: true, email: true, activo: true, createdAt: true };

function emailValido(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function suscribir(req, res) {
  const { nombre, email } = req.body || {};
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }
  if (!emailValido(email)) {
    return res.status(400).json({ error: 'Email inválido' });
  }

  const existente = await prisma.suscriptor.findUnique({ where: { email: email.toLowerCase() } });
  if (existente) {
    if (existente.activo) {
      return res.status(200).json({ mensaje: 'Ya estabas suscrito. Gracias!', suscriptor: existente });
    }
    const reactivado = await prisma.suscriptor.update({
      where: { id: existente.id },
      data: { activo: true, nombre: nombre.trim() },
    });
    return res.status(200).json({ mensaje: 'Suscripción reactivada', suscriptor: reactivado });
  }

  const suscriptor = await prisma.suscriptor.create({
    data: { nombre: nombre.trim(), email: email.toLowerCase().trim() },
  });
  return res.status(201).json({ mensaje: 'Suscripción creada', suscriptor });
}

async function listar(req, res) {
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
  const q     = (req.query.q || '').trim().toLowerCase();

  const where = q ? {
    OR: [
      { email:  { contains: q, mode: 'insensitive' } },
      { nombre: { contains: q, mode: 'insensitive' } },
    ],
  } : {};

  const [total, items] = await Promise.all([
    prisma.suscriptor.count({ where }),
    prisma.suscriptor.findMany({
      where,
      select: PUBLIC_SELECT,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  res.setHeader('X-Total-Count', total);
  return res.json({ items, total, page, limit });
}

async function desactivar(req, res) {
  const id = parseInt(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

  const actual = await prisma.suscriptor.findUnique({ where: { id } });
  if (!actual) return res.status(404).json({ error: 'Suscriptor no encontrado' });

  const suscriptor = await prisma.suscriptor.update({
    where: { id },
    data: { activo: false },
    select: PUBLIC_SELECT,
  });
  return res.json({ suscriptor });
}

async function exportarCSV(req, res) {
  const fecha = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="suscriptores-${fecha}.csv"`);

  const csv = format({ headers: true, writeBOM: true });
  csv.pipe(res);

  const suscriptores = await prisma.suscriptor.findMany({
    select: PUBLIC_SELECT,
    orderBy: { createdAt: 'asc' },
  });

  for (const s of suscriptores) {
    csv.write({
      id: s.id,
      nombre: s.nombre,
      email: s.email,
      activo: s.activo ? 'sí' : 'no',
      fecha_suscripcion: s.createdAt.toISOString(),
    });
  }

  csv.end();
}

module.exports = { suscribir, listar, desactivar, exportarCSV };
