const laundryMachineLoadRulesBusiness = require('../domain/laundryMachineLoadRules.business');
const laundryMachineLoadRulesRepository = require('../repositories/laundryMachineLoadRules.repository');
const {
  assertLaundryManagementActor,
  assertLaundryStaffActor,
} = require('../policies/authorization.policy');
const { normalizePagination } = require('../shared/pagination');

const listLoadRules = async (query = {}, context = {}) => {
  assertLaundryStaffActor(context.actor);

  const { skip, take } = normalizePagination(query);
  const where = {};

  if (query.machineId) {
    where.machineId = Number(query.machineId);
  }

  if (query.active !== undefined) {
    where.active = query.active === 'true' || query.active === true;
  }

  const result = await laundryMachineLoadRulesRepository.listLoadRules({
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

const createLoadRule = async (payload = {}, context = {}) => {
  assertLaundryManagementActor(context.actor);

  return laundryMachineLoadRulesRepository.transaction(async (tx) => {
    const machine = await laundryMachineLoadRulesRepository.findMachineById({
      machineId: payload.machineId,
      client: tx,
    });
    laundryMachineLoadRulesBusiness.assertMachineCanOwnLoadRule(machine);

    const existingRule = await laundryMachineLoadRulesRepository.findActiveLoadRuleByName({
      machineId: machine.id,
      name: payload.name,
      client: tx,
    });
    laundryMachineLoadRulesBusiness.assertUniqueActiveLoadRuleName(existingRule);

    return laundryMachineLoadRulesRepository.createLoadRule({
      data: laundryMachineLoadRulesBusiness.buildCreateLoadRuleData({ machine, payload }),
      client: tx,
    });
  });
};

const updateLoadRule = async (loadRuleId, payload = {}, context = {}) => {
  assertLaundryManagementActor(context.actor);

  return laundryMachineLoadRulesRepository.transaction(async (tx) => {
    const currentRule = await laundryMachineLoadRulesRepository.findLoadRuleById({
      loadRuleId,
      client: tx,
    });

    if (!currentRule) {
      const error = new Error('Laundry Machine Load Rule not found');
      error.statusCode = 404;
      throw error;
    }

    laundryMachineLoadRulesBusiness.assertMachineCanOwnLoadRule(currentRule.machine);

    const nextName = payload.name === undefined ? currentRule.name : payload.name;
    const existingRule = await laundryMachineLoadRulesRepository.findActiveLoadRuleByName({
      machineId: currentRule.machineId,
      name: nextName,
      excludeId: currentRule.id,
      client: tx,
    });
    laundryMachineLoadRulesBusiness.assertUniqueActiveLoadRuleName(existingRule);

    return laundryMachineLoadRulesRepository.updateLoadRule({
      loadRuleId: currentRule.id,
      data: laundryMachineLoadRulesBusiness.buildUpdateLoadRuleData({
        machine: currentRule.machine,
        currentRule,
        payload,
      }),
      client: tx,
    });
  });
};

module.exports = {
  listLoadRules,
  createLoadRule,
  updateLoadRule,
};
