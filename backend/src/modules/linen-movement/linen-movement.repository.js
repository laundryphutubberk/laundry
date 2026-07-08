const { prisma } = require('../../core/prisma');

const getClient = (client) => client || prisma;

const findAccessibleWork = async ({ workId, where, client } = {}) => {
  if (!workId) {
    return null;
  }

  const db = getClient(client);

  return db.laundryWork.findFirst({
    where: {
      ...where,
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
  findAccessibleWork,
  findItemTypeById,
  listLinenMovements,
  createLinenMovement,
  transaction,
};
