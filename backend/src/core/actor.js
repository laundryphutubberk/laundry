const USER_ROLES = Object.freeze({
  LAUNDRY_OWNER: 'LAUNDRY_OWNER',
  LAUNDRY_MANAGER: 'LAUNDRY_MANAGER',
  LAUNDRY_STAFF: 'LAUNDRY_STAFF',
  RESORT_OWNER: 'RESORT_OWNER',
  RESORT_STAFF: 'RESORT_STAFF',
});

const WORKSPACE_TYPES = Object.freeze({
  LAUNDRY: 'LAUNDRY',
  RESORT: 'RESORT',
});

const USER_ROLE_VALUES = new Set(Object.values(USER_ROLES));
const WORKSPACE_TYPE_VALUES = new Set(Object.values(WORKSPACE_TYPES));

const createActorError = (message) => {
  const error = new Error(message);
  error.statusCode = 401;
  error.code = 'INVALID_ACTOR_CONTEXT';
  return error;
};

const normalizeOptionalNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : value;
};

const normalizeActor = (actor = {}) => ({
  userId: normalizeOptionalNumber(actor.userId || actor.id || actor.sub),
  role: actor.role,
  workspaceType: actor.workspaceType,
  resortId: normalizeOptionalNumber(actor.resortId),
  active: actor.active === undefined ? true : Boolean(actor.active),
});

const assertValidActor = (actor) => {
  if (!actor || typeof actor !== 'object') {
    throw createActorError('Valid actor context is required');
  }

  if (!Number.isInteger(actor.userId) || actor.userId <= 0) {
    throw createActorError('Valid actor userId is required');
  }

  if (!USER_ROLE_VALUES.has(actor.role)) {
    throw createActorError('Valid actor role is required');
  }

  if (!WORKSPACE_TYPE_VALUES.has(actor.workspaceType)) {
    throw createActorError('Valid actor workspaceType is required');
  }

  if (actor.workspaceType === WORKSPACE_TYPES.RESORT) {
    if (!Number.isInteger(actor.resortId) || actor.resortId <= 0) {
      throw createActorError('Valid resort actor resortId is required');
    }
  }

  if (actor.workspaceType === WORKSPACE_TYPES.LAUNDRY && actor.resortId !== null) {
    throw createActorError('Laundry workspace actor must not have resortId');
  }

  if (actor.active !== true) {
    throw createActorError('Active actor is required');
  }

  return actor;
};

const normalizeAndAssertActor = (actor) => assertValidActor(normalizeActor(actor));

module.exports = {
  USER_ROLES,
  WORKSPACE_TYPES,
  normalizeActor,
  assertValidActor,
  normalizeAndAssertActor,
};
