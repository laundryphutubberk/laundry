const createBusinessError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toNumber = (value) => Number(value);

const assertMachineCanOwnLoadRule = (machine) => {
  if (!machine) {
    throw createBusinessError('Laundry Machine not found', 404);
  }

  if (machine.active === false) {
    throw createBusinessError('Inactive Laundry Machine cannot receive load rules');
  }
};

const assertLoadRuleWeights = ({ minWeightKg, targetKg, maxWeightKg }) => {
  const min = toNumber(minWeightKg);
  const target = toNumber(targetKg);
  const max = toNumber(maxWeightKg);

  if (!Number.isFinite(min) || !Number.isFinite(target) || !Number.isFinite(max)) {
    throw createBusinessError('load rule weights must be valid numbers');
  }

  if (min <= 0 || target <= 0 || max <= 0) {
    throw createBusinessError('load rule weights must be greater than zero');
  }

  if (min > target) {
    throw createBusinessError('minWeightKg cannot exceed targetKg');
  }

  if (target > max) {
    throw createBusinessError('targetKg cannot exceed maxWeightKg');
  }
};

const assertLoadRuleWithinMachineCapacity = ({ machine, maxWeightKg }) => {
  const capacity = toNumber(machine.capacityKg);
  const max = toNumber(maxWeightKg);

  if (Number.isFinite(capacity) && max > capacity) {
    throw createBusinessError('maxWeightKg cannot exceed machine capacity');
  }
};

const assertUniqueActiveLoadRuleName = (existingRule) => {
  if (existingRule) {
    throw createBusinessError('active load rule name already exists for this machine', 409);
  }
};

const buildCreateLoadRuleData = ({ machine, payload }) => {
  assertLoadRuleWeights(payload);
  assertLoadRuleWithinMachineCapacity({ machine, maxWeightKg: payload.maxWeightKg });

  return {
    machineId: machine.id,
    name: payload.name,
    minWeightKg: payload.minWeightKg,
    targetKg: payload.targetKg,
    maxWeightKg: payload.maxWeightKg,
    active: payload.active === undefined ? true : Boolean(payload.active),
  };
};

const buildUpdateLoadRuleData = ({ machine, currentRule, payload }) => {
  const nextData = {
    name: payload.name === undefined ? currentRule.name : payload.name,
    minWeightKg: payload.minWeightKg === undefined ? currentRule.minWeightKg : payload.minWeightKg,
    targetKg: payload.targetKg === undefined ? currentRule.targetKg : payload.targetKg,
    maxWeightKg: payload.maxWeightKg === undefined ? currentRule.maxWeightKg : payload.maxWeightKg,
    active: payload.active === undefined ? currentRule.active : Boolean(payload.active),
  };

  assertLoadRuleWeights(nextData);
  assertLoadRuleWithinMachineCapacity({ machine, maxWeightKg: nextData.maxWeightKg });

  return nextData;
};

module.exports = {
  assertMachineCanOwnLoadRule,
  assertLoadRuleWeights,
  assertLoadRuleWithinMachineCapacity,
  assertUniqueActiveLoadRuleName,
  buildCreateLoadRuleData,
  buildUpdateLoadRuleData,
};
