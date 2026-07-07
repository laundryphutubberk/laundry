const { prisma } = require('../core/prisma');

const DEFAULT_TAKE = 50;
const MAX_TAKE = 100;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

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
  const where = {};

  if (status) {
    where.currentStatus = status;
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

const listLaundryWorks = async (query = {}) => {
  const take = Math.min(toPositiveInt(query.take, DEFAULT_TAKE), MAX_TAKE);
  const skip = Math.max(toPositiveInt(query.skip, 0), 0);

  const where = buildWorkspaceWhere({
    workspaceType: query.workspaceType,
    resortId: query.resortId,
    status: query.status,
  });

  const [items, total] = await Promise.all([
    prisma.laundryWork.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
      include: buildWorkInclude(),
    }),
    prisma.laundryWork.count({ where }),
  ]);

  return {
    items,
    pagination: {
      total,
      skip,
      take,
    },
  };
};

const getLaundryWorkById = async (workId, query = {}) => {
  const where = buildWorkspaceWhere({
    workspaceType: query.workspaceType,
    resortId: query.resortId,
  });

  const work = await prisma.laundryWork.findFirst({
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

  if (!work) {
    const error = new Error('Laundry Work not found');
    error.statusCode = 404;
    throw error;
  }

  return work;
};

const createLaundryWork = async (payload = {}) => {
  if (!payload.resortId) {
    const error = new Error('resortId is required');
    error.statusCode = 400;
    throw error;
  }

  const workNo = payload.workNo || `LW-${Date.now()}`;

  return prisma.laundryWork.create({
    data: {
      workNo,
      resortId: Number(payload.resortId),
      bagCount: payload.bagCount ? Number(payload.bagCount) : 0,
      receivedDate: payload.receivedDate ? new Date(payload.receivedDate) : null,
      note: payload.note || null,
      currentStatus: payload.currentStatus || 'DRAFT',
    },
    include: buildWorkInclude(),
  });
};

const updateLaundryWorkStatus = async (workId, payload = {}) => {
  if (!payload.toStatus) {
    const error = new Error('toStatus is required');
    error.statusCode = 400;
    throw error;
  }

  return prisma.$transaction(async (tx) => {
    const currentWork = await tx.laundryWork.findUnique({
      where: {
        id: Number(workId),
      },
    });

    if (!currentWork) {
      const error = new Error('Laundry Work not found');
      error.statusCode = 404;
      throw error;
    }

    const updatedWork = await tx.laundryWork.update({
      where: {
        id: Number(workId),
      },
      data: {
        currentStatus: payload.toStatus,
      },
      include: buildWorkInclude(),
    });

    await tx.workStatusLog.create({
      data: {
        workId: Number(workId),
        fromStatus: currentWork.currentStatus,
        toStatus: payload.toStatus,
        changedById: payload.changedById ? Number(payload.changedById) : null,
        changedByName: payload.changedByName || null,
        note: payload.note || null,
      },
    });

    return updatedWork;
  });
};

module.exports = {
  listLaundryWorks,
  getLaundryWorkById,
  createLaundryWork,
  updateLaundryWorkStatus,
};
