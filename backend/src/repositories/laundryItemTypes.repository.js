const { prisma } = require('../core/prisma');

const listActiveLaundryItemTypes = async () => prisma.laundryItemType.findMany({
  where: { active: true },
  orderBy: [{ category: 'asc' }, { name: 'asc' }],
});

module.exports = { listActiveLaundryItemTypes };
