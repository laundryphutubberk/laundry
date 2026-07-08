const { prisma } = require('../../core/prisma');

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
      ...where,
      id: Number(workId),
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

const incrementLaundryWorkBagCount = async ({ workId, nextStatus, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.update({
    where: {
      id: Number(workId),
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

const updateLaundryBagStatus = async ({ bagId, data, client } = {}) => {
  const db = getClient(client);

  return db.laundryBag.update({
    where: {
      id: Number(bagId),
    },
    data,
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
  updateLaundryBagStatus,
  transaction,
};
