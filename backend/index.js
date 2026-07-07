const { env } = require('./src/config/env');
const { createApp } = require('./src/app');
const { prisma } = require('./src/core/prisma');
const { createRuntimeShutdown } = require('./src/core/runtimeShutdown');

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`Backend runtime listening on port ${env.PORT}`);
});

const shutdown = createRuntimeShutdown({ server, prisma });

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
