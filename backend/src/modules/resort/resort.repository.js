const { prisma } = require('../../core/prisma');

const ACTIVE_WORK_STATUSES = [
  'DRAFT',
  'BAG_RECEIVED',
  'FACTORY_RECEIVED',
  'BAG_OPENED',
  'ITEM_COUNTED',
  'TYPE_SORTED',
  'COLOR_SORTED',
  'DATA_RECORDED',
  'RETURNED',
];

const getClient = (client) => client || prisma;

const listResorts = async ({ where, skip, take, client } = {}) => {
  const db = getClient(client);

  const [items, total] = await Promise.all([
    db.resort.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
      skip,
      take,
      include: {
        _count: {
          select: {
            users: true,
            works: true,
            bags: true,
            countLines: true,
            movements: true,
            issues: true,
          },
        },
      },
    }),
    db.resort.count({ where }),
  ]);

  return {
    items,
    total,
  };
};

const findResortById = async ({ resortId, client } = {}) => {
  const db = getClient(client);

  return db.resort.findUnique({
    where: {
      id: Number(resortId),
    },
  });
};

const countActiveWorksByResort = async ({ resortId, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.count({
    where: {
      resortId: Number(resortId),
      currentStatus: {
        in: ACTIVE_WORK_STATUSES,
      },
    },
  });
};

const createResort = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.resort.create({ data });
};

const updateResort = async ({ resortId, data, client } = {}) => {
  const db = getClient(client);

  return db.resort.update({
    where: {
      id: Number(resortId),
    },
    data,
  });
};

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  ACTIVE_WORK_STATUSES,
  listResorts,
  findResortById,
  countActiveWorksByResort,
  createResort,
  updateResort,
  transaction,
};
