const createRuntimeShutdown = (dependencies) => {
  const server = dependencies.server;
  const prisma = dependencies.prisma;
  const logger = dependencies.logger || console;

  const info = typeof logger.info === 'function' ? logger.info.bind(logger) : logger.log.bind(logger);
  const error = typeof logger.error === 'function' ? logger.error.bind(logger) : logger.error.bind(logger);

  return async function handleRuntimeShutdown(signal) {
    info('runtime.shutdown.started', { signal });

    try {
      if (prisma && typeof prisma.$disconnect === 'function') {
        await prisma.$disconnect();
      }

      if (server && typeof server.close === 'function') {
        server.close(() => {
          info('runtime.shutdown.completed', { signal });
        });
        return;
      }

      info('runtime.shutdown.completed', { signal });
    } catch (shutdownError) {
      error('runtime.shutdown.failed', {
        signal,
        errorName: shutdownError.name || 'Error',
        message: shutdownError.message,
      });
    }
  };
};

module.exports = {
  createRuntimeShutdown,
};
