const { prisma } = require('../core/prisma');

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

const findBagById = async ({ bagId, client } = {}) => {
  if (!bagId) {
    return null;
  }

  const db = getClient(client);

  return db.laundryBag.findUnique({
    where: {
      id: Number(bagId),
    },
  });
};

const findItemTypeById = async ({ itemTypeId, client } = {}) => {
  const db = getClient(client);

  return db.laundryItemType.findUnique({
    where: {
      id: Number(itemTypeId),
    },
  });
};

const listLaundryCountLines = async ({ where, skip, take, client } = {}) => {
  const db = getClient(client);

  const [items, total] = await Promise.all([
    db.laundryCountLine.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
      skip,
      take,
      include: {
        itemType: true,
        bag: true,
      },
    }),
    db.laundryCountLine.count({ where }),
  ]);

  return {
    items,
    total,
  };
};

const createLaundryCountLine = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.laundryCountLine.create({
    data,
    include: {
      itemType: true,
      bag: true,
    },
  });
};

const updateWorkAfterCountLine = async ({ workId, currentStatus, client } = {}) => {
  const db = getClient(client);

  if (currentStatus !== 'BAG_OPENED') {
    return null;
  }

  return db.laundryWork.update({
    where: {
      id: Number(workId),
    },
    data: {
      currentStatus: 'ITEM_COUNTED',
    },
  });
};

const createWorkStatusLog = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.workStatusLog.create({ data });
};

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  findAccessibleWork,
  findBagById,
  findItemTypeById,
  listLaundryCountLines,
  createLaundryCountLine,
  updateWorkAfterCountLine,
  createWorkStatusLog,
  transaction,
};
