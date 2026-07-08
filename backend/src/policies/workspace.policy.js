const WORKSPACE_TYPES = Object.freeze({
  LAUNDRY: 'LAUNDRY',
  RESORT: 'RESORT',
});

const createPolicyError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertResortWorkspaceScope = ({ workspaceType, resortId } = {}) => {
  if (workspaceType === WORKSPACE_TYPES.RESORT && !resortId) {
    throw createPolicyError('resortId is required for Resort Workspace requests');
  }
};

const buildResortScopedWhere = ({ workspaceType, resortId } = {}) => {
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

module.exports = {
  WORKSPACE_TYPES,
  assertResortWorkspaceScope,
  buildResortScopedWhere,
};
