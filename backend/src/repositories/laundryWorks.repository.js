const { prisma } = require('../core/prisma');

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
      _count: {
        select: {
          bags: true,
          issues: true,
          movements: true,
        },
      },
      bags: true,
      countLines: {
        include: {
          itemType: true,
          bag: true,
        },
      },
      issues: true,
      images: {
        where: {
          deletedAt: null,
        },
        orderBy: [
          { isCover: 'desc' },
          { displayOrder: 'asc' },
          { uploadedAt: 'asc' },
        ],
      },
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

const findLaundryWorkByIdForUpdate = async ({ workId, where, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.findFirst({
    where: {
      ...where,
      id: Number(workId),
    },
    include: buildWorkInclude(),
  });
};

const updateLaundryWorkStatus = async ({ workId, where, expectedStatus, toStatus, client } = {}) => {
  const db = getClient(client);

  const updateResult = await db.laundryWork.updateMany({
    where: {
      ...where,
      id: Number(workId),
      currentStatus: expectedStatus,
    },
    data: {
      currentStatus: toStatus,
    },
  });

  if (updateResult.count === 0) {
    return null;
  }

  return db.laundryWork.findFirst({
    where: {
      ...where,
      id: Number(workId),
    },
    include: buildWorkInclude(),
  });
};

const deleteLaundryWork = async ({ workId, where, client } = {}) => {
  const db = getClient(client);
  const deleteResult = await db.laundryWork.deleteMany({
    where: {
      ...where,
      id: Number(workId),
      currentStatus: 'DRAFT',
    },
  });

  return deleteResult.count > 0;
};

const createWorkStatusLog = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.workStatusLog.create({
    data,
  });
};

const findCountLinesForRecording = async ({ workId, client } = {}) => {
  const db = getClient(client);
  return db.laundryCountLine.findMany({
    where: { workId: Number(workId) },
    include: { itemType: true },
    orderBy: { id: 'asc' },
  });
};

const lockWorkDataRecording = async ({ workId, client } = {}) => {
  const db = getClient(client);
  const key = `laundry-work-record:${workId}`;
  await db.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))::text AS lock_result`;
};

const createCountedMovements = async ({ work, groups, client } = {}) => {
  const db = getClient(client);
  await db.linenMovement.createMany({
    data: groups.map((group) => ({
      resortId: work.resortId,
      workId: work.id,
      itemTypeId: group.itemTypeId,
      colorGroup: group.colorGroup,
      movementType: 'COUNTED_AT_LAUNDRY',
      quantity: group.quantity,
      note: 'Derived from recorded Laundry Work Count Lines',
    })),
  });
};

const upsertInventorySummaries = async ({ work, groups, client } = {}) => {
  const db = getClient(client);
  for (const group of groups) {
    await db.linenInventorySummary.upsert({
      where: {
        resortId_itemTypeId_colorGroup: {
          resortId: work.resortId,
          itemTypeId: group.itemTypeId,
          colorGroup: group.colorGroup,
        },
      },
      create: {
        resortId: work.resortId,
        itemTypeId: group.itemTypeId,
        colorGroup: group.colorGroup,
        totalKnownQty: group.quantity,
        atLaundryQty: group.quantity,
        calculatedAt: new Date(),
      },
      update: {
        totalKnownQty: { increment: group.quantity },
        atLaundryQty: { increment: group.quantity },
        calculatedAt: new Date(),
      },
    });
  }
};

const countRecordedMovements = async ({ workId, client } = {}) => {
  const db = getClient(client);
  return db.linenMovement.count({
    where: { workId: Number(workId), movementType: 'COUNTED_AT_LAUNDRY' },
  });
};

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  listLaundryWorks,
  findLaundryWorkById,
  createLaundryWork,
  findLaundryWorkByIdForUpdate,
  updateLaundryWorkStatus,
  deleteLaundryWork,
  createWorkStatusLog,
  findCountLinesForRecording,
  lockWorkDataRecording,
  createCountedMovements,
  upsertInventorySummaries,
  countRecordedMovements,
  transaction,
};
