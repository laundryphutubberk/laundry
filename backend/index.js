const { env } = require('./src/config/env');
const { createApp } = require('./src/app');
const { prisma } = require('./src/core/prisma');
const { createRuntimeShutdown } = require('./src/core/runtimeShutdown');
const { logger } = require('./src/core/observability');

const app = createApp();
const server = app.listen(env.PORT, () => {
  logger.info('runtime.started', {
    service: 'laundry-backend',
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
  });
});

const shutdown = createRuntimeShutdown({ server, prisma, logger });

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
