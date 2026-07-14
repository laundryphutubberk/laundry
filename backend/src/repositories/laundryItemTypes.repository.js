const { prisma } = require('../core/prisma');

const getClient = (client) => client || prisma;

const listLaundryItemTypes = async ({ where, skip, take, client } = {}) => {
  const db = getClient(client);
  const [items, total] = await Promise.all([
    db.laundryItemType.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
      skip,
      take,
    }),
    db.laundryItemType.count({ where }),
  ]);
  return { items, total };
};

const listActiveLaundryItemTypes = async () => prisma.laundryItemType.findMany({
  where: { active: true },
  orderBy: [{ category: 'asc' }, { name: 'asc' }],
});

const findLaundryItemTypeById = async ({ itemTypeId, client } = {}) => getClient(client).laundryItemType.findUnique({
  where: { id: Number(itemTypeId) },
});

const findConflictingLaundryItemType = async ({ name, category, excludeItemTypeId, client } = {}) => getClient(client).laundryItemType.findFirst({
  where: {
    name,
    category: category ?? null,
    ...(excludeItemTypeId ? { id: { not: Number(excludeItemTypeId) } } : {}),
  },
});

const createLaundryItemType = async ({ data, client } = {}) => getClient(client).laundryItemType.create({ data });

const updateLaundryItemType = async ({ itemTypeId, data, client } = {}) => getClient(client).laundryItemType.update({
  where: { id: Number(itemTypeId) },
  data,
});

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  listLaundryItemTypes,
  listActiveLaundryItemTypes,
  findLaundryItemTypeById,
  findConflictingLaundryItemType,
  createLaundryItemType,
  updateLaundryItemType,
  transaction,
};
