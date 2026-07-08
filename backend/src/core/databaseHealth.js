const { prisma } = require('./prisma');
const { observeHistogram } = require('./observability');

const getDurationMs = (startedAt) => {
  const diff = process.hrtime.bigint() - startedAt;
  return Number(diff / 1000000n);
};

const getDatabaseHealth = async () => {
  const startedAt = process.hrtime.bigint();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const durationMs = getDurationMs(startedAt);

    observeHistogram('database_health_duration_ms', { status: 'ok' }, durationMs);

    return {
      status: 'ok',
      durationMs,
    };
  } catch (_error) {
    const durationMs = getDurationMs(startedAt);

    observeHistogram('database_health_duration_ms', { status: 'error' }, durationMs);

    return {
      status: 'error',
      durationMs,
    };
  }
};

module.exports = {
  getDatabaseHealth,
};
