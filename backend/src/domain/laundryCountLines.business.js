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

const assertWorkCountingIsOpen = (work) => {
  if (!work) throw createBusinessError('Laundry Work not found', 404);
  if (work.currentStatus !== 'BAG_OPENED') {
    throw createBusinessError('Laundry Work counting is not open');
  }
};

const assertCountLineUpdateAllowed = (work, payload = {}) => {
  if (!work) throw createBusinessError('Laundry Work not found', 404);
  if (work.currentStatus === 'BAG_OPENED') return;
  if (!['ITEM_COUNTED', 'TYPE_SORTED'].includes(work.currentStatus)) {
    throw createBusinessError('Laundry Count Line is immutable in the current Work status', 409);
  }
  if (payload.quantity !== undefined || payload.bagId !== undefined) {
    throw createBusinessError('Counted quantity and Bag linkage are immutable after counting completion', 409);
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

const buildCreateCountLineData = ({ work, payload, itemType }) => {
  const quantity = Number(payload.quantity || 0);
  const issueQuantity = Number(payload.issueQuantity || 0);

  assertCountQuantities({ quantity, issueQuantity });

  return {
    workId: work.id,
    bagId: payload.bagId ? Number(payload.bagId) : null,
    resortId: work.resortId,
    itemTypeId: Number(itemType?.id || payload.itemTypeId),
    colorGroup: payload.colorGroup || null,
    quantity,
    issueQuantity,
    note: payload.note || null,
  };
};

const buildUpdateCountLineData = ({ payload, itemType }) => {
  const data = {};

  if (payload.bagId !== undefined) data.bagId = payload.bagId === null ? null : Number(payload.bagId);
  if (itemType) data.itemTypeId = Number(itemType.id);
  if (payload.colorGroup !== undefined) data.colorGroup = payload.colorGroup || null;
  if (payload.quantity !== undefined) data.quantity = Number(payload.quantity);
  if (payload.note !== undefined) data.note = payload.note || null;

  return data;
};

const assertUpdatedCountQuantities = ({ currentLine, payload }) => {
  const quantity = payload.quantity === undefined ? currentLine.quantity : Number(payload.quantity);
  const issueQuantity = payload.issueQuantity === undefined
    ? currentLine.issueQuantity
    : Number(payload.issueQuantity);
  assertCountQuantities({ quantity, issueQuantity });
};

const normalizeColorGroup = (value) => {
  const normalized = String(value || '').trim();
  return normalized || null;
};

const assertUniqueCountDimension = (existingLine) => {
  if (existingLine) throw createBusinessError('Count Line already exists for this Bag, Item Type, and color', 409);
};

const assertCountingCanComplete = (bags) => {
  if (!bags || bags.length === 0) throw createBusinessError('Laundry Work has no Bags to complete', 409);
  const incomplete = bags.find((bag) => bag.status !== 'OPENED' || Number(bag._count?.countLines || 0) === 0);
  if (incomplete) throw createBusinessError('Every Bag must be opened and contain at least one Count Line', 409);
};

const shouldMoveWorkToItemCounted = (currentStatus) => currentStatus === 'BAG_OPENED';

module.exports = {
  assertWorkCanAcceptCountLine,
  assertWorkCountingIsOpen,
  assertCountLineUpdateAllowed,
  assertBagBelongsToWork,
  assertBagCanAcceptCountLine,
  assertItemTypeCanBeCounted,
  assertCountQuantities,
  buildCreateCountLineData,
  buildUpdateCountLineData,
  assertUpdatedCountQuantities,
  normalizeColorGroup,
  assertUniqueCountDimension,
  assertCountingCanComplete,
  shouldMoveWorkToItemCounted,
};
