const prisma = require('../utils/prisma');
const { cloudinary } = require('../utils/cloudinary');

const CREADOR_SELECT = { select: { id: true, nombre: true } };

function parseDate(v) {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function parseIntOrNull(v) {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function eventoFromBody(body, file) {
  const data = {};
  if (body.titulo      !== undefined) data.titulo      = body.titulo.trim();
  if (body.descripcion !== undefined) data.descripcion = body.descripcion.trim() || null;
  if (body.fecha       !== undefined) data.fecha       = parseDate(body.fecha);
  if (body.fechaFin    !== undefined) data.fechaFin    = parseDate(body.fechaFin);
  if (body.lugar       !== undefined) data.lugar       = body.lugar.trim();
  if (body.artista     !== undefined) data.artista     = body.artista.trim() || null;
  if (body.aforo       !== undefined) data.aforo       = parseIntOrNull(body.aforo);
  if (body.categoria   !== undefined) data.categoria   = body.categoria.trim();
  if (body.tipo        !== undefined) data.tipo        = body.tipo.trim();
  if (body.organizador !== undefined) data.organizador = body.organizador.trim() || null;
  if (body.valor       !== undefined) data.valor       = parseIntOrNull(body.valor);
  if (body.publicado   !== undefined) data.publicado   = body.publicado === true || body.publicado === 'true';
  if (file)                            data.imagenUrl   = file.path;
  return data;
}

function validarCreacion(data) {
  if (!data.titulo)    return 'titulo es obligatorio';
  if (!data.fecha)     return 'fecha es obligatoria y debe ser válida';
  if (!data.lugar)     return 'lugar es obligatorio';
  if (!data.categoria) return 'categoria es obligatoria';
  if (!data.tipo)      return 'tipo es obligatorio';
  return null;
}

async function listar(req, res) {
  const { categoria, lugar, tipo, desde, hasta, publicado } = req.query;
  const page  = Math.max(1, parseInt(req.query.page)  || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

  const where = {};
  if (publicado === 'true')       where.publicado = true;
  else if (publicado === 'false') where.publicado = false;
  else if (publicado !== 'all')   where.publicado = true;

  if (categoria) where.categoria = categoria;
  if (lugar)     where.lugar     = lugar;
  if (tipo)      where.tipo      = tipo;

  const desdeDate = parseDate(desde);
  const hastaDate = parseDate(hasta);
  if (desdeDate || hastaDate) {
    where.fecha = {};
    if (desdeDate) where.fecha.gte = desdeDate;
    if (hastaDate) where.fecha.lte = hastaDate;
  }

  const [total, eventos] = await Promise.all([
    prisma.evento.count({ where }),
    prisma.evento.findMany({
      where,
      orderBy: { fecha: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { creadoPor: CREADOR_SELECT },
    }),
  ]);

  res.setHeader('X-Total-Count', total);
  return res.json({ items: eventos, total, page, limit });
}

async function obtener(req, res) {
  const id = parseInt(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

  const evento = await prisma.evento.findUnique({
    where: { id },
    include: { creadoPor: CREADOR_SELECT },
  });
  if (!evento) return res.status(404).json({ error: 'Evento no encontrado' });

  return res.json({ evento });
}

async function crear(req, res) {
  const data = eventoFromBody(req.body, req.file);
  const err = validarCreacion(data);
  if (err) return res.status(400).json({ error: err });

  data.creadoPorId = req.user.id;

  const evento = await prisma.evento.create({
    data,
    include: { creadoPor: CREADOR_SELECT },
  });
  return res.status(201).json({ evento });
}

async function actualizar(req, res) {
  const id = parseInt(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

  const actual = await prisma.evento.findUnique({ where: { id } });
  if (!actual) return res.status(404).json({ error: 'Evento no encontrado' });

  if (req.user.rol === 'FUNCIONARIO' && actual.creadoPorId !== req.user.id) {
    return res.status(403).json({ error: 'Solo puedes editar tus propios eventos' });
  }

  const data = eventoFromBody(req.body, req.file);

  const evento = await prisma.evento.update({
    where: { id },
    data,
    include: { creadoPor: CREADOR_SELECT },
  });
  return res.json({ evento });
}

async function eliminar(req, res) {
  const id = parseInt(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ error: 'id inválido' });

  const actual = await prisma.evento.findUnique({ where: { id } });
  if (!actual) return res.status(404).json({ error: 'Evento no encontrado' });

  await prisma.evento.delete({ where: { id } });
  return res.status(204).end();
}

module.exports = { listar, obtener, crear, actualizar, eliminar };
