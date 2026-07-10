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

const assertWorkStatusTransition = (currentStatus, nextStatus) => {
  const allowedStatuses = WORK_STATUS_TRANSITIONS[currentStatus] || new Set();

  if (!allowedStatuses.has(nextStatus)) {
    throw createBusinessError(`Cannot change Laundry Work status from ${currentStatus} to ${nextStatus}`);
  }
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

const buildCreateWorkData = (payload, generatedWorkNo) => ({
  workNo: payload.workNo || generatedWorkNo,
  resortId: Number(payload.resortId),
  bagCount: payload.bagCount ? Number(payload.bagCount) : 0,
  receivedDate: payload.receivedDate ? new Date(payload.receivedDate) : null,
  note: payload.note || null,
  currentStatus: payload.currentStatus || 'DRAFT',
});

const buildStatusLogData = ({ workId, fromStatus, payload }) => ({
  workId: Number(workId),
  fromStatus,
  toStatus: payload.toStatus,
  changedById: payload.changedById ? Number(payload.changedById) : null,
  changedByName: payload.changedByName || null,
  note: payload.note || null,
});

module.exports = {
  assertResortCanReceiveWork,
  assertUniqueWorkNo,
  assertInitialWorkStatus,
  assertWorkStatusTransition,
  buildWorkNoPrefix,
  buildNextWorkNo,
  buildCreateWorkData,
  buildStatusLogData,
};
