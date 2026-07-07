const { PrismaClient } = require('@prisma/client');
const { env } = require('../config/env');

const prisma = new PrismaClient({
  datasourceUrl: env.DATABASE_URL,
});

module.exports = {
  prisma,
};
