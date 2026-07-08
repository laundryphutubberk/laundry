const MOVEMENT_QUANTITY_DIRECTIONS = {
  COUNTED_AT_LAUNDRY: 1,
  ISSUE_REPORTED: 1,
  RETURNED_TO_RESORT: -1,
  ADJUSTMENT: 1,
};

const WORK_STATUSES_ALLOWING_MOVEMENT = new Set([
  'ITEM_COUNTED',
  'TYPE_SORTED',
  'COLOR_SORTED',
  'DATA_RECORDED',
  'RETURNED',
  'CLOSED',
]);

const createBusinessError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertMovementQuantity = ({ movementType, quantity }) => {
  if (!movementType) {
    throw createBusinessError('movementType is required');
  }

  if (!Number.isInteger(quantity)) {
    throw createBusinessError('quantity must be an integer');
  }

  if (movementType !== 'ADJUSTMENT' && quantity <= 0) {
    throw createBusinessError('quantity must be greater than zero');
  }

  if (movementType === 'ADJUSTMENT' && quantity === 0) {
    throw createBusinessError('adjustment quantity cannot be zero');
  }
};

const assertWorkCanCreateMovement = (work) => {
  if (!work) {
    return;
  }

  if (!WORK_STATUSES_ALLOWING_MOVEMENT.has(work.currentStatus)) {
    throw createBusinessError('Laundry Work is not ready for linen movement');
  }
};

const assertMovementMatchesWork = ({ work, payload }) => {
  if (!work) {
    return;
  }

  if (Number(work.resortId) !== Number(payload.resortId)) {
    throw createBusinessError('Movement resortId must match Laundry Work resortId');
  }
};

const assertItemTypeCanMove = (itemType) => {
  if (!itemType) {
    throw createBusinessError('Laundry Item Type not found', 404);
  }

  if (itemType.active === false) {
    throw createBusinessError('Inactive Laundry Item Type cannot be moved');
  }
};

const buildCreateMovementData = (payload = {}) => {
  const quantity = Number(payload.quantity);

  assertMovementQuantity({
    movementType: payload.movementType,
    quantity,
  });

  return {
    resortId: Number(payload.resortId),
    workId: payload.workId ? Number(payload.workId) : null,
    itemTypeId: Number(payload.itemTypeId),
    colorGroup: payload.colorGroup || null,
    movementType: payload.movementType,
    quantity,
    occurredAt: payload.occurredAt ? new Date(payload.occurredAt) : new Date(),
    note: payload.note || null,
  };
};

const getMovementDirection = (movementType) => MOVEMENT_QUANTITY_DIRECTIONS[movementType] || 1;

module.exports = {
  assertMovementQuantity,
  assertWorkCanCreateMovement,
  assertMovementMatchesWork,
  assertItemTypeCanMove,
  buildCreateMovementData,
  getMovementDirection,
};
