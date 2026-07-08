const WORKSPACE_TYPES = Object.freeze({
  LAUNDRY: 'LAUNDRY',
  RESORT: 'RESORT',
});

const createPolicyError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getWorkspaceScopeFromActor = (actor = {}) => {
  if (!actor) {
    return {};
  }

  return {
    workspaceType: actor.workspaceType,
    resortId: actor.resortId,
  };
};

const getWorkspaceScope = ({ actor, workspaceType, resortId } = {}) => {
  const actorScope = getWorkspaceScopeFromActor(actor);

  return {
    workspaceType: actorScope.workspaceType || workspaceType,
    resortId: actorScope.resortId || resortId,
  };
};

const assertResortWorkspaceScope = ({ workspaceType, resortId } = {}) => {
  if (workspaceType === WORKSPACE_TYPES.RESORT && !resortId) {
    throw createPolicyError('resortId is required for Resort Workspace requests');
  }
};

const buildResortScopedWhere = ({ actor, workspaceType, resortId } = {}) => {
  const scope = getWorkspaceScope({ actor, workspaceType, resortId });
  assertResortWorkspaceScope(scope);

  const where = {};

  if (scope.workspaceType === WORKSPACE_TYPES.RESORT) {
    where.resortId = Number(scope.resortId);
    return where;
  }

  if (scope.resortId) {
    where.resortId = Number(scope.resortId);
  }

  return where;
};

module.exports = {
  WORKSPACE_TYPES,
  assertResortWorkspaceScope,
  buildResortScopedWhere,
  getWorkspaceScope,
  getWorkspaceScopeFromActor,
};
