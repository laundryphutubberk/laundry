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

const createActorError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = 'INVALID_ACTOR_CONTEXT';
  return error;
};

const toPositiveIntegerOrNull = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numberValue = Number(value);

  if (!Number.isInteger(numberValue) || numberValue <= 0) {
    return null;
  }

  return numberValue;
};

const normalizeActor = (actor = {}) => {
  if (!actor || typeof actor !== 'object') {
    return null;
  }

  const normalized = {
    userId: toPositiveIntegerOrNull(actor.userId || actor.id),
    role: actor.role || null,
    workspaceType: actor.workspaceType || null,
    resortId: toPositiveIntegerOrNull(actor.resortId),
    active: actor.active !== undefined ? Boolean(actor.active) : null,
  };

  if (actor.onboardingStatus !== undefined || actor.hasBusinessContext !== undefined) {
    normalized.onboardingStatus = actor.onboardingStatus || 'NOT_REQUIRED';
    normalized.hasBusinessContext = actor.hasBusinessContext !== undefined
      ? actor.hasBusinessContext === true
      : Boolean(actor.role && actor.workspaceType);
  }

  return normalized;
};

const assertValidActor = (actor) => {
  if (!actor) {
    throw createActorError('Authenticated actor context is required');
  }

  if (!actor.userId) {
    throw createActorError('Actor userId is required');
  }

  if (actor.active !== true) {
    throw createActorError('Actor is not active', 403);
  }

  if (actor.onboardingStatus === 'PENDING' && actor.hasBusinessContext === false && !actor.role && !actor.workspaceType && !actor.resortId) {
    return actor;
  }

  if (!Object.values(USER_ROLES).includes(actor.role)) {
    throw createActorError('Actor role is invalid', 403);
  }

  if (!Object.values(WORKSPACE_TYPES).includes(actor.workspaceType)) {
    throw createActorError('Actor workspaceType is invalid', 403);
  }

  if (actor.workspaceType === WORKSPACE_TYPES.RESORT && !actor.resortId) {
    throw createActorError('Resort actor requires resortId', 403);
  }

  return actor;
};

const normalizeAndAssertActor = (actor) => {
  return assertValidActor(normalizeActor(actor));
};

module.exports = {
  USER_ROLES,
  WORKSPACE_TYPES,
  normalizeActor,
  assertValidActor,
  normalizeAndAssertActor,
};
