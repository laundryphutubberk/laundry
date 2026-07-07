const { prisma } = require('./prisma');

const getDatabaseHealth = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return {
      status: 'ok',
    };
  } catch (_error) {
    return {
      status: 'error',
    };
  }
};

module.exports = {
  getDatabaseHealth,
};
