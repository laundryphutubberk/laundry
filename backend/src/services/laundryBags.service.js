const { prisma } = require('../core/prisma');

const DEFAULT_TAKE = 50;
const MAX_TAKE = 100;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

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

const assertWorkAccessible = async (tx, workId, query = {}) => {
  const where = buildWorkspaceWhere({
    workspaceType: query.workspaceType,
    resortId: query.resortId,
  });

  const work = await tx.laundryWork.findFirst({
    where: {
      id: Number(workId),
      ...(where.resortId ? { resortId: where.resortId } : {}),
    },
  });

  if (!work) {
    const error = new Error('Laundry Work not found');
    error.statusCode = 404;
    throw error;
  }

  return work;
};

const listLaundryBags = async (workId, query = {}) => {
  const take = Math.min(toPositiveInt(query.take, DEFAULT_TAKE), MAX_TAKE);
  const skip = Math.max(toPositiveInt(query.skip, 0), 0);

  const where = {
    ...buildWorkspaceWhere({
      workspaceType: query.workspaceType,
      resortId: query.resortId,
      status: query.status,
    }),
    workId: Number(workId),
  };

  const [items, total] = await Promise.all([
    prisma.laundryBag.findMany({
      where,
      orderBy: {
        createdAt: 'asc',
      },
      skip,
      take,
      include: buildBagInclude(),
    }),
    prisma.laundryBag.count({ where }),
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

const getLaundryBagById = async (workId, bagId, query = {}) => {
  const where = {
    ...buildWorkspaceWhere({
      workspaceType: query.workspaceType,
      resortId: query.resortId,
    }),
    workId: Number(workId),
    id: Number(bagId),
  };

  const bag = await prisma.laundryBag.findFirst({
    where,
    include: buildBagInclude(),
  });

  if (!bag) {
    const error = new Error('Laundry Bag not found');
    error.statusCode = 404;
    throw error;
  }

  return bag;
};

const createLaundryBag = async (workId, payload = {}) => {
  return prisma.$transaction(async (tx) => {
    const work = await assertWorkAccessible(tx, workId);

    const bag = await tx.laundryBag.create({
      data: {
        workId: work.id,
        resortId: work.resortId,
        bagNo: payload.bagNo,
        receivedAt: payload.receivedAt ? new Date(payload.receivedAt) : new Date(),
        note: payload.note || null,
      },
      include: buildBagInclude(),
    });

    await tx.laundryWork.update({
      where: {
        id: work.id,
      },
      data: {
        bagCount: {
          increment: 1,
        },
        currentStatus: work.currentStatus === 'DRAFT' ? 'BAG_RECEIVED' : work.currentStatus,
      },
    });

    if (work.currentStatus === 'DRAFT') {
      await tx.workStatusLog.create({
        data: {
          workId: work.id,
          fromStatus: 'DRAFT',
          toStatus: 'BAG_RECEIVED',
          note: 'First bag received',
        },
      });
    }

    return bag;
  });
};

const updateLaundryBagStatus = async (workId, bagId, payload = {}) => {
  return prisma.$transaction(async (tx) => {
    await assertWorkAccessible(tx, workId);

    const currentBag = await tx.laundryBag.findFirst({
      where: {
        id: Number(bagId),
        workId: Number(workId),
      },
    });

    if (!currentBag) {
      const error = new Error('Laundry Bag not found');
      error.statusCode = 404;
      throw error;
    }

    const shouldSetOpenedAt = payload.toStatus === 'OPENED' && !currentBag.openedAt;

    return tx.laundryBag.update({
      where: {
        id: currentBag.id,
      },
      data: {
        status: payload.toStatus,
        openedAt: payload.openedAt
          ? new Date(payload.openedAt)
          : shouldSetOpenedAt
            ? new Date()
            : currentBag.openedAt,
        note: payload.note !== undefined ? payload.note : currentBag.note,
      },
      include: buildBagInclude(),
    });
  });
};

module.exports = {
  listLaundryBags,
  getLaundryBagById,
  createLaundryBag,
  updateLaundryBagStatus,
};
