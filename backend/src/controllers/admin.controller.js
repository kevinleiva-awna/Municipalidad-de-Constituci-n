const prisma = require('../utils/prisma');

async function stats(req, res) {
  const ahora = new Date();
  const en7dias = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const en30dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const [
    totalEventos,
    eventosPublicados,
    totalUsuarios,
    usuariosActivos,
    porRol,
    porCategoria,
    proximos7,
    proximos30,
    proximosLista,
  ] = await Promise.all([
    prisma.evento.count(),
    prisma.evento.count({ where: { publicado: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { activo: true } }),
    prisma.user.groupBy({ by: ['rol'], _count: { id: true } }),
    prisma.evento.groupBy({
      by: ['categoria'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
    prisma.evento.count({ where: { publicado: true, fecha: { gte: ahora, lte: en7dias } } }),
    prisma.evento.count({ where: { publicado: true, fecha: { gte: ahora, lte: en30dias } } }),
    prisma.evento.findMany({
      where: { publicado: true, fecha: { gte: ahora } },
      orderBy: { fecha: 'asc' },
      take: 5,
      include: { creadoPor: { select: { id: true, nombre: true } } },
    }),
  ]);

  const usuariosPorRol = porRol.reduce((acc, r) => {
    acc[r.rol] = r._count.id;
    return acc;
  }, { ADMIN: 0, FUNCIONARIO: 0, CIUDADANO: 0 });

  const totalParaPorcentaje = totalEventos || 1;
  const eventosPorCategoria = porCategoria.map((c) => ({
    nombre: c.categoria,
    cantidad: c._count.id,
    porcentaje: Math.round((c._count.id / totalParaPorcentaje) * 100),
  }));

  return res.json({
    eventos: {
      total: totalEventos,
      publicados: eventosPublicados,
      borradores: totalEventos - eventosPublicados,
      proximos7dias: proximos7,
      proximos30dias: proximos30,
    },
    usuarios: {
      total: totalUsuarios,
      activos: usuariosActivos,
      porRol: usuariosPorRol,
    },
    eventosPorCategoria,
    proximosEventos: proximosLista,
  });
}

module.exports = { stats };
