const washLoadPlansBusiness = require('../domain/washLoadPlans.business');
const washLoadPlansRepository = require('../repositories/washLoadPlans.repository');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');
const { normalizePagination } = require('../shared/pagination');

const buildWashLoadPlanWhere = ({ actor, status } = {}) => {
  const workWhere = buildRequiredActorResortScopedWhere({ actor });
  const where = {};

  if (status) {
    where.status = status;
  }

  if (workWhere.resortId) {
    where.work = {
      resortId: workWhere.resortId,
    };
  }

  return where;
};

const listWashLoadPlans = async (query = {}, context = {}) => {
  const { skip, take } = normalizePagination(query);

  const where = buildWashLoadPlanWhere({
    actor: context.actor,
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

const createWashLoadPlan = async (workId, payload = {}, context = {}) => {
  return washLoadPlansRepository.transaction(async (tx) => {
    const workWhere = buildRequiredActorResortScopedWhere({ actor: context.actor });

    const work = await washLoadPlansRepository.findAccessibleWork({
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

const updateWashLoadPlanStatus = async (planId, payload = {}, context = {}) => {
  return washLoadPlansRepository.transaction(async (tx) => {
    const where = buildWashLoadPlanWhere({ actor: context.actor });

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
