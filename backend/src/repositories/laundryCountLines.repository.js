const { prisma } = require('../core/prisma');

const getClient = (client) => client || prisma;

const buildCountLineInclude = () => ({
  itemType: true,
  bag: true,
});

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

const findOrCreateItemTypeByName = async ({ itemTypeName, client } = {}) => {
  const db = getClient(client);
  const name = String(itemTypeName || '').trim();

  if (!name) {
    return null;
  }

  const existing = await db.laundryItemType.findFirst({
    where: {
      name,
      category: null,
    },
  });

  if (existing) {
    return existing;
  }

  return db.laundryItemType.create({
    data: {
      name,
      category: null,
      active: true,
    },
  });
};

const resolveItemType = async ({ itemTypeId, itemTypeName, client } = {}) => {
  if (itemTypeId) {
    return findItemTypeById({ itemTypeId, client });
  }

  return findOrCreateItemTypeByName({ itemTypeName, client });
};

const lockCountLineDimension = async ({ workId, bagId, itemTypeId, colorGroup, client } = {}) => {
  const db = getClient(client);
  const key = `${workId}:${bagId}:${itemTypeId}:${String(colorGroup || '').trim().toLowerCase()}`;
  await db.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))::text AS lock_result`;
};

const findDuplicateCountLine = async ({ workId, bagId, itemTypeId, colorGroup, excludeLineId, client } = {}) => {
  const db = getClient(client);
  const normalizedColor = String(colorGroup || '').trim();
  return db.laundryCountLine.findFirst({
    where: {
      workId: Number(workId),
      bagId: Number(bagId),
      itemTypeId: Number(itemTypeId),
      ...(normalizedColor
        ? { colorGroup: { equals: normalizedColor, mode: 'insensitive' } }
        : { OR: [{ colorGroup: null }, { colorGroup: '' }] }),
      ...(excludeLineId ? { id: { not: Number(excludeLineId) } } : {}),
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
      include: buildCountLineInclude(),
    }),
    db.laundryCountLine.count({ where }),
  ]);

  return {
    items,
    total,
  };
};

const findLaundryCountLineById = async ({ lineId, where, client } = {}) => {
  const db = getClient(client);

  return db.laundryCountLine.findFirst({
    where: {
      ...where,
      id: Number(lineId),
    },
    include: buildCountLineInclude(),
  });
};

const createLaundryCountLine = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.laundryCountLine.create({
    data,
    include: buildCountLineInclude(),
  });
};

const updateLaundryCountLine = async ({ lineId, data, client } = {}) => {
  const db = getClient(client);

  return db.laundryCountLine.update({
    where: {
      id: Number(lineId),
    },
    data,
    include: buildCountLineInclude(),
  });
};

const deleteLaundryCountLine = async ({ lineId, client } = {}) => {
  const db = getClient(client);

  await db.laundryCountLine.delete({
    where: {
      id: Number(lineId),
    },
  });

  return { deleted: true };
};

const updateWorkAfterCountLine = async ({ workId, expectedStatus, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.updateMany({
    where: {
      id: Number(workId),
      currentStatus: expectedStatus,
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

const listBagsForCountingCompletion = async ({ workId, client } = {}) => {
  const db = getClient(client);
  return db.laundryBag.findMany({
    where: { workId: Number(workId) },
    include: { _count: { select: { countLines: true } } },
  });
};

const completeCounting = async ({ workId, expectedStatus, client } = {}) => {
  const db = getClient(client);
  const workUpdate = await db.laundryWork.updateMany({
    where: { id: Number(workId), currentStatus: expectedStatus },
    data: { currentStatus: 'ITEM_COUNTED' },
  });
  if (workUpdate.count === 0) return null;
  await db.laundryBag.updateMany({
    where: { workId: Number(workId), status: 'OPENED' },
    data: { status: 'COUNTED' },
  });
  return db.laundryWork.findUnique({ where: { id: Number(workId) } });
};

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  findAccessibleWork,
  findBagById,
  findItemTypeById,
  findOrCreateItemTypeByName,
  resolveItemType,
  lockCountLineDimension,
  findDuplicateCountLine,
  listLaundryCountLines,
  findLaundryCountLineById,
  createLaundryCountLine,
  updateLaundryCountLine,
  deleteLaundryCountLine,
  updateWorkAfterCountLine,
  createWorkStatusLog,
  listBagsForCountingCompletion,
  completeCounting,
  transaction,
};
