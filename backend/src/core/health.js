const { getDatabaseHealth } = require('./databaseHealth');
const { getMetricsSnapshot } = require('./observability');

const getHealthStatus = async () => {
  const database = await getDatabaseHealth();
  const runtimeStatus = database.status === 'ok' ? 'ok' : 'degraded';

  return {
    status: runtimeStatus,
    service: 'laundry-backend',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    dependencies: {
      database,
    },
    observability: {
      metrics: getMetricsSnapshot(),
    },
  };
};

module.exports = {
  getHealthStatus,
};
