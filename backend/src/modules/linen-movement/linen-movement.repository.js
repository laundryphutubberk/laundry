const { prisma } = require('../../core/prisma');
const { buildResortScopedWhere } = require('../../shared/workspaceScope');

const getClient = (client) => client || prisma;

const buildWorkspaceWhere = ({ workspaceType, resortId, movementType } = {}) => {
  const where = buildResortScopedWhere({ workspaceType, resortId });

  if (movementType) {
    where.movementType = movementType;
  }

  return where;
};

const findWorkById = async ({ workId, client } = {}) => {
  if (!workId) {
    return null;
  }

  const db = getClient(client);

  return db.laundryWork.findUnique({
    where: {
      id: Number(workId),
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

const listLinenMovements = async ({ where, skip, take, client } = {}) => {
  const db = getClient(client);

  const [items, total] = await Promise.all([
    db.linenMovement.findMany({
      where,
      orderBy: {
        occurredAt: 'desc',
      },
      skip,
      take,
      include: {
        itemType: true,
        work: true,
      },
    }),
    db.linenMovement.count({ where }),
  ]);

  return {
    items,
    total,
  };
};

const createLinenMovement = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.linenMovement.create({
    data,
    include: {
      itemType: true,
      work: true,
    },
  });
};

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  buildWorkspaceWhere,
  findWorkById,
  findItemTypeById,
  listLinenMovements,
  createLinenMovement,
  transaction,
};
