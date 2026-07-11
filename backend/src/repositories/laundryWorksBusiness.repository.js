const { prisma } = require('../core/prisma');

const getClient = (client) => client || prisma;

const findResortById = async ({ resortId, client } = {}) => {
  const db = getClient(client);

  return db.resort.findUnique({
    where: {
      id: Number(resortId),
    },
  });
};

const findLaundryWorkByWorkNo = async ({ workNo, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.findUnique({
    where: {
      workNo,
    },
  });
};

const findLatestLaundryWorkByPrefix = async ({ workNoPrefix, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.findFirst({
    where: {
      workNo: {
        startsWith: workNoPrefix,
      },
    },
    orderBy: {
      workNo: 'desc',
    },
    select: {
      workNo: true,
    },
  });
};

const lockLaundryWorkNumberPrefix = async ({ workNoPrefix, client } = {}) => {
  const db = getClient(client);
  await db.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${workNoPrefix}))::text AS lock_result`;
};

module.exports = {
  findResortById,
  findLaundryWorkByWorkNo,
  findLatestLaundryWorkByPrefix,
  lockLaundryWorkNumberPrefix,
};
