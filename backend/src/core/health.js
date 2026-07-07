const getHealthStatus = () => {
  return {
    status: 'ok',
    service: 'laundry-backend',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  getHealthStatus,
};
