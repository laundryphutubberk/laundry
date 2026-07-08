const { WORKSPACE_TYPES, assertValidActor } = require('../core/actor');

const createPolicyError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = 'WORKSPACE_POLICY_VIOLATION';
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

const getRequiredActorWorkspaceScope = (actor) => {
  const validActor = assertValidActor(actor);

  return {
    workspaceType: validActor.workspaceType,
    resortId: validActor.resortId,
  };
};

const assertResortWorkspaceScope = ({ workspaceType, resortId } = {}) => {
  if (workspaceType === WORKSPACE_TYPES.RESORT && !resortId) {
    throw createPolicyError('resortId is required for Resort Workspace requests');
  }
};

const buildResortScopedWhereFromScope = ({ workspaceType, resortId } = {}) => {
  assertResortWorkspaceScope({ workspaceType, resortId });

  const where = {};

  if (workspaceType === WORKSPACE_TYPES.RESORT) {
    where.resortId = Number(resortId);
    return where;
  }

  if (resortId) {
    where.resortId = Number(resortId);
  }

  return where;
};

const buildResortScopedWhere = ({ actor, workspaceType, resortId } = {}) => {
  return buildResortScopedWhereFromScope(getWorkspaceScope({ actor, workspaceType, resortId }));
};

const buildRequiredActorResortScopedWhere = ({ actor } = {}) => {
  return buildResortScopedWhereFromScope(getRequiredActorWorkspaceScope(actor));
};

module.exports = {
  WORKSPACE_TYPES,
  assertResortWorkspaceScope,
  buildResortScopedWhere,
  buildRequiredActorResortScopedWhere,
  getRequiredActorWorkspaceScope,
  getWorkspaceScope,
  getWorkspaceScopeFromActor,
};
