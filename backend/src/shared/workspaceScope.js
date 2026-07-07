const buildResortScopedWhere = ({ workspaceType, resortId } = {}) => {
  const where = {};

  if (workspaceType === 'RESORT') {
    if (!resortId) {
      const error = new Error('resortId is required for Resort Workspace requests');
      error.statusCode = 400;
      throw error;
    }

    where.resortId = Number(resortId);
  }

  if (workspaceType !== 'RESORT' && resortId) {
    where.resortId = Number(resortId);
  }

  return where;
};

module.exports = {
  buildResortScopedWhere,
};
