const { sendSuccess } = require('../core/httpResponse');
const { getRequestPolicyContext } = require('../core/policyContext');
const { listActiveLaundryItemTypes } = require('../services/laundryItemTypes.service');

const listActiveLaundryItemTypesController = async (req, res, next) => {
  try {
    return sendSuccess(res, await listActiveLaundryItemTypes(req.query, getRequestPolicyContext(req)));
  } catch (error) {
    return next(error);
  }
};

module.exports = { listActiveLaundryItemTypesController };
