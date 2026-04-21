// TODO Día 6: cargar 8-10 eventos culturales reales de la Muni + los 3 usuarios demo.
// Usuarios demo planificados: admin@constitucion.cl, funcionario@constitucion.cl, ciudadano@constitucion.cl

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('seed vacío — por completar en el Día 6');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
