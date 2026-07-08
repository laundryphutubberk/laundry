const washLoadPlansBusiness = require('./wash-load-plan.business');
const washLoadPlansRepository = require('./wash-load-plan.repository');
const { normalizePagination } = require('../../shared/pagination');

const listWashLoadPlans = async (query = {}) => {
  const { skip, take } = normalizePagination(query);

  const where = washLoadPlansRepository.buildWorkspaceWhere({
    workspaceType: query.workspaceType,
    resortId: query.resortId,
    status: query.status,
  });

  if (query.workId) {
    where.workId = Number(query.workId);
  }

  const result = await washLoadPlansRepository.listWashLoadPlans({
    where,
    skip,
    take,
  });

  return {
    items: result.items,
    pagination: {
      total: result.total,
      skip,
      take,
    },
  };
};

const createWashLoadPlan = async (workId, payload = {}, query = {}) => {
  return washLoadPlansRepository.transaction(async (tx) => {
    const workWhere = query.resortId ? { resortId: Number(query.resortId) } : {};

    const work = await washLoadPlansRepository.findWorkById({
      workId,
      where: workWhere,
      client: tx,
    });
    washLoadPlansBusiness.assertWorkCanReceiveWashLoadPlan(work);

    const machine = await washLoadPlansRepository.findMachineById({
      machineId: payload.machineId,
      client: tx,
    });
    washLoadPlansBusiness.assertMachineCanBePlanned(machine);

    const loadRule = await washLoadPlansRepository.findLoadRuleById({
      loadRuleId: payload.loadRuleId,
      client: tx,
    });
    washLoadPlansBusiness.assertLoadRuleMatchesMachine({
      loadRule,
      machineId: machine.id,
    });

    const existingPlan = await washLoadPlansRepository.findPlanByWorkAndLoadNo({
      workId: work.id,
      loadNo: payload.loadNo,
      client: tx,
    });
    washLoadPlansBusiness.assertLoadNoAvailable(existingPlan);

    return washLoadPlansRepository.createWashLoadPlan({
      data: washLoadPlansBusiness.buildCreateWashLoadPlanData({
        work,
        payload,
        loadRule,
      }),
      client: tx,
    });
  });
};

const updateWashLoadPlanStatus = async (planId, payload = {}, query = {}) => {
  return washLoadPlansRepository.transaction(async (tx) => {
    const where = washLoadPlansRepository.buildWorkspaceWhere({
      workspaceType: query.workspaceType,
      resortId: query.resortId,
    });

    const currentPlan = await washLoadPlansRepository.findPlanById({
      planId,
      where,
      client: tx,
    });

    if (!currentPlan) {
      const error = new Error('Wash Load Plan not found');
      error.statusCode = 404;
      throw error;
    }

    return washLoadPlansRepository.updateWashLoadPlanStatus({
      planId: currentPlan.id,
      data: washLoadPlansBusiness.buildWashLoadStatusUpdateData({ currentPlan, payload }),
      client: tx,
    });
  });
};

module.exports = {
  listWashLoadPlans,
  createWashLoadPlan,
  updateWashLoadPlanStatus,
};
