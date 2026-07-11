const CLOSED_WORK_STATUSES = new Set(['CLOSED', 'CANCELLED']);

const BAG_STATUS_TRANSITIONS = {
  RECEIVED: new Set(['OPENED', 'CLOSED']),
  OPENED: new Set(['COUNTED', 'CLOSED']),
  COUNTED: new Set(['CLOSED']),
  CLOSED: new Set([]),
};

const createBusinessError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertWorkCanReceiveBag = (work) => {
  if (!work) {
    throw createBusinessError('Laundry Work not found', 404);
  }

  if (CLOSED_WORK_STATUSES.has(work.currentStatus)) {
    throw createBusinessError('Laundry Work cannot receive new bags in its current status');
  }
};

const assertUniqueBagNo = (existingBag) => {
  if (existingBag) {
    throw createBusinessError('bagNo already exists for this Laundry Work', 409);
  }
};

const getNextWorkStatusAfterBagReceived = (currentStatus) => {
  return currentStatus === 'DRAFT' ? 'BAG_RECEIVED' : currentStatus;
};

const shouldCreateFirstBagStatusLog = (work) => {
  return work.currentStatus === 'DRAFT';
};

const assertBagStatusTransition = (currentStatus, nextStatus) => {
  const allowedStatuses = BAG_STATUS_TRANSITIONS[currentStatus] || new Set();

  if (!allowedStatuses.has(nextStatus)) {
    throw createBusinessError(`Cannot change Laundry Bag status from ${currentStatus} to ${nextStatus}`);
  }
};

const assertWorkCanOpenBag = (work) => {
  if (!work) throw createBusinessError('Laundry Work not found', 404);
  if (!['FACTORY_RECEIVED', 'BAG_OPENED'].includes(work.currentStatus)) {
    throw createBusinessError('Laundry Work is not ready to open bags');
  }
};

const buildBagStatusUpdateData = ({ currentBag, payload }) => {
  assertBagStatusTransition(currentBag.status, payload.toStatus);

  const shouldSetOpenedAt = payload.toStatus === 'OPENED' && !currentBag.openedAt;

  return {
    status: payload.toStatus,
    openedAt: payload.openedAt
      ? new Date(payload.openedAt)
      : shouldSetOpenedAt
        ? new Date()
        : currentBag.openedAt,
    note: payload.note !== undefined ? payload.note : currentBag.note,
  };
};

module.exports = {
  assertWorkCanReceiveBag,
  assertUniqueBagNo,
  getNextWorkStatusAfterBagReceived,
  shouldCreateFirstBagStatusLog,
  assertWorkCanOpenBag,
  buildBagStatusUpdateData,
};
