const { prisma } = require('../core/prisma');

const getClient = (client) => client || prisma;

const findMachineById = async ({ machineId, client } = {}) => {
  const db = getClient(client);

  return db.laundryMachine.findUnique({
    where: {
      id: Number(machineId),
    },
  });
};

const findLoadRuleById = async ({ loadRuleId, client } = {}) => {
  const db = getClient(client);

  return db.laundryMachineLoadRule.findUnique({
    where: {
      id: Number(loadRuleId),
    },
    include: {
      machine: true,
    },
  });
};

const findActiveLoadRuleByName = async ({ machineId, name, excludeId, client } = {}) => {
  const db = getClient(client);

  return db.laundryMachineLoadRule.findFirst({
    where: {
      machineId: Number(machineId),
      name,
      active: true,
      ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
    },
  });
};

const listLoadRules = async ({ where, skip, take, client } = {}) => {
  const db = getClient(client);

  const [items, total] = await Promise.all([
    db.laundryMachineLoadRule.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
      include: {
        machine: true,
      },
    }),
    db.laundryMachineLoadRule.count({ where }),
  ]);

  return {
    items,
    total,
  };
};

const createLoadRule = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.laundryMachineLoadRule.create({
    data,
    include: {
      machine: true,
    },
  });
};

const updateLoadRule = async ({ loadRuleId, data, client } = {}) => {
  const db = getClient(client);

  return db.laundryMachineLoadRule.update({
    where: {
      id: Number(loadRuleId),
    },
    data,
    include: {
      machine: true,
    },
  });
};

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  findMachineById,
  findLoadRuleById,
  findActiveLoadRuleByName,
  listLoadRules,
  createLoadRule,
  updateLoadRule,
  transaction,
};
