const WORK_STATUS_TRANSITIONS = {
  DRAFT: new Set(['BAG_RECEIVED', 'CANCELLED']),
  BAG_RECEIVED: new Set(['FACTORY_RECEIVED', 'CANCELLED']),
  FACTORY_RECEIVED: new Set(['BAG_OPENED', 'CANCELLED']),
  BAG_OPENED: new Set(['ITEM_COUNTED', 'CANCELLED']),
  ITEM_COUNTED: new Set(['TYPE_SORTED', 'CANCELLED']),
  TYPE_SORTED: new Set(['COLOR_SORTED', 'CANCELLED']),
  COLOR_SORTED: new Set(['DATA_RECORDED', 'CANCELLED']),
  DATA_RECORDED: new Set(['RETURNED', 'CANCELLED']),
  RETURNED: new Set(['CLOSED']),
  CLOSED: new Set([]),
  CANCELLED: new Set([]),
};

const createBusinessError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertResortCanReceiveWork = (resort) => {
  if (!resort) {
    throw createBusinessError('Resort not found', 404);
  }

  if (resort.active === false) {
    throw createBusinessError('Inactive Resort cannot receive new Laundry Work');
  }
};

const assertUniqueWorkNo = (existingWork) => {
  if (existingWork) {
    throw createBusinessError('workNo already exists', 409);
  }
};

const assertInitialWorkStatus = (status) => {
  if (status && status !== 'DRAFT' && status !== 'BAG_RECEIVED') {
    throw createBusinessError('Laundry Work can only be created as DRAFT or BAG_RECEIVED');
  }
};

const resolveInitialWorkStatus = (bagCount) => (
  Number(bagCount || 0) > 0 ? 'BAG_RECEIVED' : 'DRAFT'
);

const buildInitialBagData = ({ workNo, resortId, bagCount, receivedDate }) => {
  const count = Number(bagCount || 0);
  const receivedAt = receivedDate ? new Date(receivedDate) : new Date();

  return Array.from({ length: count }, (_, index) => ({
    resortId: Number(resortId),
    bagNo: `${workNo}-BAG-${String(index + 1).padStart(3, '0')}`,
    receivedAt,
  }));
};

const assertWorkStatusTransition = (currentStatus, nextStatus) => {
  if (
    (currentStatus === 'DRAFT' && nextStatus === 'BAG_RECEIVED')
    || (currentStatus === 'FACTORY_RECEIVED' && nextStatus === 'BAG_OPENED')
    || (currentStatus === 'BAG_OPENED' && nextStatus === 'ITEM_COUNTED')
    || (currentStatus === 'ITEM_COUNTED' && nextStatus === 'TYPE_SORTED')
    || (currentStatus === 'TYPE_SORTED' && nextStatus === 'COLOR_SORTED')
    || (currentStatus === 'COLOR_SORTED' && nextStatus === 'DATA_RECORDED')
  ) {
    throw createBusinessError('This Laundry Work transition requires its explicit operational command', 409);
  }

  const allowedStatuses = WORK_STATUS_TRANSITIONS[currentStatus] || new Set();

  if (!allowedStatuses.has(nextStatus)) {
    throw createBusinessError(`Cannot change Laundry Work status from ${currentStatus} to ${nextStatus}`);
  }
};

const assertTypeSortingCanComplete = (countLines) => {
  if (!countLines?.length) throw createBusinessError('Laundry Work has no Count Lines', 409);
  if (countLines.some((line) => !line.itemType || line.itemType.active === false)) {
    throw createBusinessError('Every Count Line must have an active Item Type', 409);
  }
};

const assertColorSortingCanComplete = (countLines) => {
  if (!countLines?.length || countLines.some((line) => !String(line.colorGroup || '').trim())) {
    throw createBusinessError('Every Count Line must have a color before color sorting completes', 409);
  }
};

const aggregateRecordedCountLines = (countLines) => {
  const groups = new Map();
  for (const line of countLines || []) {
    const colorGroup = String(line.colorGroup || '').trim();
    const key = `${line.itemTypeId}:${colorGroup.toLowerCase()}`;
    const current = groups.get(key) || { itemTypeId: line.itemTypeId, colorGroup, quantity: 0 };
    current.quantity += Number(line.quantity || 0);
    groups.set(key, current);
  }
  return [...groups.values()];
};

const formatBangkokDate = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}${values.month}${values.day}`;
};

const buildWorkNoPrefix = (date = new Date()) => `LW-${formatBangkokDate(date)}-`;

const buildNextWorkNo = ({ prefix, latestWorkNo } = {}) => {
  const latestSequence = latestWorkNo?.startsWith(prefix)
    ? Number(latestWorkNo.slice(prefix.length))
    : 0;
  const nextSequence = Number.isInteger(latestSequence) ? latestSequence + 1 : 1;

  return `${prefix}${String(nextSequence).padStart(3, '0')}`;
};

const buildCreateWorkData = (payload, generatedWorkNo, actor) => {
  const workNo = payload.workNo || generatedWorkNo;
  const bagCount = Number(payload.bagCount || 0);
  const bags = buildInitialBagData({
    workNo,
    resortId: payload.resortId,
    bagCount,
    receivedDate: payload.receivedDate,
  });

  return {
    workNo,
    resortId: Number(payload.resortId),
    bagCount,
    receivedDate: payload.receivedDate ? new Date(payload.receivedDate) : null,
    note: payload.note || null,
    currentStatus: resolveInitialWorkStatus(bagCount),
    createdById: actor?.userId || null,
    ...(bags.length > 0 ? { bags: { create: bags } } : {}),
  };
};

const buildStatusLogData = ({ workId, fromStatus, payload, actor }) => ({
  workId: Number(workId),
  fromStatus,
  toStatus: payload.toStatus,
  changedById: actor?.userId || null,
  changedByName: actor?.displayName || null,
  note: payload.note || null,
});

module.exports = {
  assertResortCanReceiveWork,
  assertUniqueWorkNo,
  assertInitialWorkStatus,
  resolveInitialWorkStatus,
  buildInitialBagData,
  assertWorkStatusTransition,
  assertTypeSortingCanComplete,
  assertColorSortingCanComplete,
  aggregateRecordedCountLines,
  buildWorkNoPrefix,
  buildNextWorkNo,
  buildCreateWorkData,
  buildStatusLogData,
};
