const { WORKSPACE_TYPES, assertValidActor } = require('../core/actor');

const buildRequiredActorResortScopedWhere = ({ actor }) => {
  const validActor = assertValidActor(actor);

  if (validActor.workspaceType === WORKSPACE_TYPES.RESORT) {
    return {
      resortId: validActor.resortId,
    };
  }

  return {};
};

const getRequiredActorWorkspaceScope = (actor) => {
  const validActor = assertValidActor(actor);

  return {
    workspaceType: validActor.workspaceType,
    resortId: validActor.workspaceType === WORKSPACE_TYPES.RESORT ? validActor.resortId : null,
  };
};

const buildResortScopedWhere = ({ actor, workspaceType, resortId } = {}) => {
  if (actor) {
    return buildRequiredActorResortScopedWhere({ actor });
  }

  if (workspaceType === WORKSPACE_TYPES.RESORT) {
    return {
      resortId: Number(resortId),
    };
  }

  return {};
};

module.exports = {
  buildRequiredActorResortScopedWhere,
  buildResortScopedWhere,
  getRequiredActorWorkspaceScope,
};
