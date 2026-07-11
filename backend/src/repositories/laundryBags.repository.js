const { prisma } = require('../core/prisma');

const buildBagInclude = () => ({
  work: {
    select: {
      id: true,
      workNo: true,
      currentStatus: true,
    },
  },
  resort: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: {
      countLines: true,
    },
  },
});

const getClient = (client) => client || prisma;

const findAccessibleWork = async ({ workId, where, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.findFirst({
    where: {
      id: Number(workId),
      ...(where && where.resortId ? { resortId: where.resortId } : {}),
    },
  });
};

const listLaundryBags = async ({ where, skip, take, client } = {}) => {
  const db = getClient(client);

  const [items, total] = await Promise.all([
    db.laundryBag.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
      skip,
      take,
      include: buildBagInclude(),
    }),
    db.laundryBag.count({ where }),
  ]);

  return {
    items,
    total,
  };
};

const findLaundryBagById = async ({ where, client } = {}) => {
  const db = getClient(client);

  return db.laundryBag.findFirst({
    where,
    include: buildBagInclude(),
  });
};

const findLaundryBagByBagNo = async ({ workId, bagNo, client } = {}) => {
  const db = getClient(client);

  return db.laundryBag.findFirst({
    where: {
      workId: Number(workId),
      bagNo,
    },
  });
};

const createLaundryBag = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.laundryBag.create({
    data,
    include: buildBagInclude(),
  });
};

const incrementLaundryWorkBagCount = async ({ workId, expectedStatus, nextStatus, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.updateMany({
    where: {
      id: Number(workId),
      currentStatus: expectedStatus,
    },
    data: {
      bagCount: {
        increment: 1,
      },
      currentStatus: nextStatus,
    },
  });
};

const createWorkStatusLog = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.workStatusLog.create({
    data,
  });
};

const updateWorkAfterFirstBagOpened = async ({ workId, client } = {}) => {
  const db = getClient(client);
  return db.laundryWork.updateMany({
    where: { id: Number(workId), currentStatus: 'FACTORY_RECEIVED' },
    data: { currentStatus: 'BAG_OPENED' },
  });
};

const updateLaundryBagStatus = async ({ bagId, expectedStatus, data, client } = {}) => {
  const db = getClient(client);

  const updateResult = await db.laundryBag.updateMany({
    where: {
      id: Number(bagId),
      status: expectedStatus,
    },
    data,
  });

  if (updateResult.count === 0) {
    return null;
  }

  return db.laundryBag.findFirst({
    where: {
      id: Number(bagId),
    },
    include: buildBagInclude(),
  });
};

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  findAccessibleWork,
  listLaundryBags,
  findLaundryBagById,
  findLaundryBagByBagNo,
  createLaundryBag,
  incrementLaundryWorkBagCount,
  createWorkStatusLog,
  updateWorkAfterFirstBagOpened,
  updateLaundryBagStatus,
  transaction,
};
