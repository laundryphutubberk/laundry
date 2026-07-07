const createRuntimeShutdown = (dependencies) => {
  const server = dependencies.server;
  const prisma = dependencies.prisma;
  const logger = dependencies.logger || console;

  return async function handleRuntimeShutdown(signal) {
    logger.log(`${signal} received. Backend runtime shutdown started.`);

    if (prisma && typeof prisma.$disconnect === 'function') {
      await prisma.$disconnect();
    }

    if (server && typeof server.close === 'function') {
      server.close();
    }
  };
};

module.exports = {
  createRuntimeShutdown,
};
