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

const buildWorkspaceWhere = ({ workspaceType, resortId, status }) => {
  const where = {};

  if (status) {
    where.status = status;
  }

  if (workspaceType === 'RESORT') {
    if (!resortId) {
      const error = new Error('resortId is required for Resort Workspace requests');
      error.statusCode = 400;
      throw error;
    }

    where.resortId = Number(resortId);
  }

  if (workspaceType !== 'RESORT' && resortId) {
    where.resortId = Number(resortId);
  }

  return where;
};

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

const createLaundryBag = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.laundryBag.create({
    data,
    include: buildBagInclude(),
  });
};

const incrementLaundryWorkBagCount = async ({ workId, currentStatus, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.update({
    where: {
      id: Number(workId),
    },
    data: {
      bagCount: {
        increment: 1,
      },
      currentStatus: currentStatus === 'DRAFT' ? 'BAG_RECEIVED' : currentStatus,
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
  buildWorkspaceWhere,
  findAccessibleWork,
  listLaundryBags,
  findLaundryBagById,
  createLaundryBag,
  incrementLaundryWorkBagCount,
  createWorkStatusLog,
  updateLaundryBagStatus,
  transaction,
};
