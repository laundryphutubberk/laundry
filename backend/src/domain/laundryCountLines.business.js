const WORK_STATUSES_ACCEPTING_COUNT_LINES = new Set([
  'BAG_OPENED',
  'ITEM_COUNTED',
  'TYPE_SORTED',
  'COLOR_SORTED',
]);

const createBusinessError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertWorkCanAcceptCountLine = (work) => {
  if (!work) {
    throw createBusinessError('Laundry Work not found', 404);
  }

  if (!WORK_STATUSES_ACCEPTING_COUNT_LINES.has(work.currentStatus)) {
    throw createBusinessError('Laundry Work is not ready for count lines');
  }
};

const assertBagBelongsToWork = ({ bag, workId }) => {
  if (!bag) {
    throw createBusinessError('Laundry Bag not found', 404);
  }

  if (Number(bag.workId) !== Number(workId)) {
    throw createBusinessError('Laundry Bag does not belong to this Laundry Work');
  }
};

const assertBagCanAcceptCountLine = (bag) => {
  if (!bag) {
    return;
  }

  if (bag.status !== 'OPENED' && bag.status !== 'COUNTED') {
    throw createBusinessError('Laundry Bag must be opened before count lines can be recorded');
  }
};

const assertItemTypeCanBeCounted = (itemType) => {
  if (!itemType) {
    throw createBusinessError('Laundry Item Type not found', 404);
  }

  if (itemType.active === false) {
    throw createBusinessError('Inactive Laundry Item Type cannot be counted');
  }
};

const assertCountQuantities = ({ quantity, issueQuantity }) => {
  if (quantity < 0) {
    throw createBusinessError('quantity cannot be negative');
  }

  if (issueQuantity < 0) {
    throw createBusinessError('issueQuantity cannot be negative');
  }

  if (issueQuantity > quantity) {
    throw createBusinessError('issueQuantity cannot exceed quantity');
  }
};

const buildCreateCountLineData = ({ work, payload }) => {
  const quantity = Number(payload.quantity || 0);
  const issueQuantity = Number(payload.issueQuantity || 0);

  assertCountQuantities({ quantity, issueQuantity });

  return {
    workId: work.id,
    bagId: payload.bagId ? Number(payload.bagId) : null,
    resortId: work.resortId,
    itemTypeId: Number(payload.itemTypeId),
    colorGroup: payload.colorGroup || null,
    quantity,
    issueQuantity,
    note: payload.note || null,
  };
};

const shouldMoveWorkToItemCounted = (currentStatus) => currentStatus === 'BAG_OPENED';

module.exports = {
  assertWorkCanAcceptCountLine,
  assertBagBelongsToWork,
  assertBagCanAcceptCountLine,
  assertItemTypeCanBeCounted,
  assertCountQuantities,
  buildCreateCountLineData,
  shouldMoveWorkToItemCounted,
};
