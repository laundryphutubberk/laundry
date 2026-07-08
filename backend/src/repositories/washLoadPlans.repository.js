const { prisma } = require('../core/prisma');

const getClient = (client) => client || prisma;

const findAccessibleWork = async ({ workId, where, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.findFirst({
    where: {
      id: Number(workId),
      ...(where && where.resortId ? { resortId: where.resortId } : {}),
    },
  });
};

const findMachineById = async ({ machineId, client } = {}) => {
  const db = getClient(client);

  return db.laundryMachine.findUnique({
    where: {
      id: Number(machineId),
    },
  });
};

const findLoadRuleById = async ({ loadRuleId, client } = {}) => {
  if (!loadRuleId) {
    return null;
  }

  const db = getClient(client);

  return db.laundryMachineLoadRule.findUnique({
    where: {
      id: Number(loadRuleId),
    },
  });
};

const findPlanByWorkAndLoadNo = async ({ workId, loadNo, client } = {}) => {
  const db = getClient(client);

  return db.washLoadPlan.findUnique({
    where: {
      workId_loadNo: {
        workId: Number(workId),
        loadNo: Number(loadNo),
      },
    },
  });
};

const findPlanById = async ({ planId, where, client } = {}) => {
  const db = getClient(client);

  return db.washLoadPlan.findFirst({
    where: {
      ...where,
      id: Number(planId),
    },
    include: {
      work: true,
      machine: true,
      loadRule: true,
    },
  });
};

const listWashLoadPlans = async ({ where, skip, take, client } = {}) => {
  const db = getClient(client);

  const [items, total] = await Promise.all([
    db.washLoadPlan.findMany({
      where,
      orderBy: {
        loadNo: 'asc',
      },
      skip,
      take,
      include: {
        work: true,
        machine: true,
        loadRule: true,
      },
    }),
    db.washLoadPlan.count({ where }),
  ]);

  return {
    items,
    total,
  };
};

const createWashLoadPlan = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.washLoadPlan.create({
    data,
    include: {
      work: true,
      machine: true,
      loadRule: true,
    },
  });
};

const updateWashLoadPlanStatus = async ({ planId, data, client } = {}) => {
  const db = getClient(client);

  return db.washLoadPlan.update({
    where: {
      id: Number(planId),
    },
    data,
    include: {
      work: true,
      machine: true,
      loadRule: true,
    },
  });
};

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  findAccessibleWork,
  findMachineById,
  findLoadRuleById,
  findPlanByWorkAndLoadNo,
  findPlanById,
  listWashLoadPlans,
  createWashLoadPlan,
  updateWashLoadPlanStatus,
  transaction,
};
