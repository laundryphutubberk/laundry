const { prisma } = require('../core/prisma');

const getClient = (client) => client || prisma;

const findCustodyByWorkId = async ({ workId, client } = {}) => {
  const db = getClient(client);
  return db.inboundCustodyOperation.findUnique({
    where: { workId: Number(workId) },
  });
};

const findCustodyByWorkIdForUpdate = async ({ workId, client } = {}) => {
  const db = getClient(client);
  return db.inboundCustodyOperation.findUnique({
    where: { workId: Number(workId) },
  });
};

const createCustody = async ({ data, client } = {}) => {
  const db = getClient(client);
  return db.inboundCustodyOperation.create({
    data,
  });
};

const updateCustody = async ({ workId, data, client } = {}) => {
  const db = getClient(client);
  return db.inboundCustodyOperation.update({
    where: { workId: Number(workId) },
    data,
  });
};

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  findCustodyByWorkId,
  findCustodyByWorkIdForUpdate,
  createCustody,
  updateCustody,
  transaction,
};
