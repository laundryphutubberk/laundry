const { prisma } = require('../../core/prisma');
const { buildResortScopedWhere } = require('../../shared/workspaceScope');

const buildWorkInclude = () => ({
  resort: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: {
      bags: true,
      countLines: true,
      issues: true,
      movements: true,
    },
  },
});

const buildWorkspaceWhere = ({ workspaceType, resortId, status }) => {
  const where = buildResortScopedWhere({ workspaceType, resortId });

  if (status) {
    where.currentStatus = status;
  }

  return where;
};

const getClient = (client) => client || prisma;

const listLaundryWorks = async ({ where, skip, take, client } = {}) => {
  const db = getClient(client);

  const [items, total] = await Promise.all([
    db.laundryWork.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
      include: buildWorkInclude(),
    }),
    db.laundryWork.count({ where }),
  ]);

  return {
    items,
    total,
  };
};

const findLaundryWorkById = async ({ workId, where, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.findFirst({
    where: {
      ...where,
      id: Number(workId),
    },
    include: {
      ...buildWorkInclude(),
      bags: true,
      countLines: true,
      issues: true,
      movements: true,
      statusLogs: {
        orderBy: {
          changedAt: 'desc',
        },
      },
    },
  });
};

const createLaundryWork = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.create({
    data,
    include: buildWorkInclude(),
  });
};

const findLaundryWorkByIdForUpdate = async ({ workId, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.findUnique({
    where: {
      id: Number(workId),
    },
  });
};

const updateLaundryWorkStatus = async ({ workId, toStatus, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.update({
    where: {
      id: Number(workId),
    },
    data: {
      currentStatus: toStatus,
    },
    include: buildWorkInclude(),
  });
};

const createWorkStatusLog = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.workStatusLog.create({
    data,
  });
};

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

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  buildWorkspaceWhere,
  listLaundryWorks,
  findLaundryWorkById,
  createLaundryWork,
  findLaundryWorkByIdForUpdate,
  updateLaundryWorkStatus,
  createWorkStatusLog,
  findResortById,
  findLaundryWorkByWorkNo,
  transaction,
};
