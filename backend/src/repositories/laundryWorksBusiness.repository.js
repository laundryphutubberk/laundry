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

module.exports = {
  findResortById,
  findLaundryWorkByWorkNo,
};
