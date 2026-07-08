const WORK_STATUSES_ALLOWING_WASH_LOAD_PLAN = new Set([
  'ITEM_COUNTED',
  'TYPE_SORTED',
  'COLOR_SORTED',
  'DATA_RECORDED',
]);

const WASH_LOAD_STATUS_TRANSITIONS = {
  DRAFT: new Set(['PLANNED', 'CANCELLED']),
  PLANNED: new Set(['IN_PROGRESS', 'CANCELLED']),
  IN_PROGRESS: new Set(['COMPLETED', 'CANCELLED']),
  COMPLETED: new Set([]),
  CANCELLED: new Set([]),
};

const createBusinessError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toNumber = (value) => Number(value);

const assertWorkCanReceiveWashLoadPlan = (work) => {
  if (!work) {
    throw createBusinessError('Laundry Work not found', 404);
  }

  if (!WORK_STATUSES_ALLOWING_WASH_LOAD_PLAN.has(work.currentStatus)) {
    throw createBusinessError('Laundry Work is not ready for wash load planning');
  }
};

const assertMachineCanBePlanned = (machine) => {
  if (!machine) {
    throw createBusinessError('Laundry Machine not found', 404);
  }

  if (machine.active === false) {
    throw createBusinessError('Inactive Laundry Machine cannot be planned');
  }
};

const assertLoadRuleMatchesMachine = ({ loadRule, machineId }) => {
  if (!loadRule) {
    return;
  }

  if (loadRule.active === false) {
    throw createBusinessError('Inactive load rule cannot be used');
  }

  if (Number(loadRule.machineId) !== Number(machineId)) {
    throw createBusinessError('Load rule does not belong to the selected machine');
  }
};

const assertLoadNoAvailable = (existingPlan) => {
  if (existingPlan) {
    throw createBusinessError('loadNo already exists for this Laundry Work', 409);
  }
};

const assertLoadPlanQuantities = ({ estimatedPieceCount, totalWeightKg }) => {
  const pieces = Number(estimatedPieceCount || 0);
  const totalWeight = toNumber(totalWeightKg);

  if (!Number.isInteger(pieces) || pieces < 0) {
    throw createBusinessError('estimatedPieceCount must be a non-negative integer');
  }

  if (!Number.isFinite(totalWeight) || totalWeight <= 0) {
    throw createBusinessError('totalWeightKg must be greater than zero');
  }
};

const calculateFitStatus = ({ totalWeightKg, loadRule }) => {
  if (!loadRule) {
    return 'UNCHECKED';
  }

  const totalWeight = toNumber(totalWeightKg);
  const min = toNumber(loadRule.minWeightKg);
  const max = toNumber(loadRule.maxWeightKg);

  if (totalWeight < min) {
    return 'UNDER_LOADED';
  }

  if (totalWeight > max) {
    return 'OVER_LOADED';
  }

  return 'OPTIMAL';
};

const assertWashLoadStatusTransition = (currentStatus, nextStatus) => {
  const allowedStatuses = WASH_LOAD_STATUS_TRANSITIONS[currentStatus] || new Set();

  if (!allowedStatuses.has(nextStatus)) {
    throw createBusinessError(`Cannot change Wash Load Plan status from ${currentStatus} to ${nextStatus}`);
  }
};

const buildCreateWashLoadPlanData = ({ work, payload, loadRule }) => {
  assertLoadPlanQuantities(payload);

  return {
    workId: work.id,
    machineId: Number(payload.machineId),
    loadRuleId: payload.loadRuleId ? Number(payload.loadRuleId) : null,
    loadNo: Number(payload.loadNo),
    estimatedPieceCount: Number(payload.estimatedPieceCount || 0),
    totalWeightKg: payload.totalWeightKg,
    status: payload.status || 'DRAFT',
    fitStatus: calculateFitStatus({ totalWeightKg: payload.totalWeightKg, loadRule }),
    note: payload.note || null,
  };
};

const buildWashLoadStatusUpdateData = ({ currentPlan, payload }) => {
  assertWashLoadStatusTransition(currentPlan.status, payload.toStatus);

  return {
    status: payload.toStatus,
  };
};

module.exports = {
  assertWorkCanReceiveWashLoadPlan,
  assertMachineCanBePlanned,
  assertLoadRuleMatchesMachine,
  assertLoadNoAvailable,
  assertLoadPlanQuantities,
  calculateFitStatus,
  assertWashLoadStatusTransition,
  buildCreateWashLoadPlanData,
  buildWashLoadStatusUpdateData,
};
