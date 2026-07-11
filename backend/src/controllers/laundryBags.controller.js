const { sendSuccess } = require('../core/httpResponse');
const { getRequestPolicyContext } = require('../core/policyContext');
const {
  listLaundryBags,
  getLaundryBagById,
  createLaundryBag,
  updateLaundryBagStatus,
} = require('../services/laundryBags.service');
const {
  parseRequest,
  listLaundryBagsQuerySchema,
  getLaundryBagQuerySchema,
  createLaundryBagBodySchema,
  updateLaundryBagStatusBodySchema,
} = require('../validators/laundryBags.validator');

const listLaundryBagsController = async (req, res, next) => {
  try {
    const query = parseRequest(listLaundryBagsQuerySchema, req.query);
    const result = await listLaundryBags(req.params.workId, query, getRequestPolicyContext(req));
    return sendSuccess(res, result.items, { pagination: result.pagination });
  } catch (error) {
    return next(error);
  }
};

const getLaundryBagController = async (req, res, next) => {
  try {
    const query = parseRequest(getLaundryBagQuerySchema, req.query);
    const bag = await getLaundryBagById(req.params.workId, req.params.bagId, query, getRequestPolicyContext(req));
    return sendSuccess(res, bag);
  } catch (error) {
    return next(error);
  }
};

const createLaundryBagController = async (req, res, next) => {
  try {
    const body = parseRequest(createLaundryBagBodySchema, req.body);
    const bag = await createLaundryBag(req.params.workId, body, getRequestPolicyContext(req));
    return sendSuccess(res, bag, undefined, 201);
  } catch (error) {
    return next(error);
  }
};

const updateLaundryBagStatusController = async (req, res, next) => {
  try {
    const body = parseRequest(updateLaundryBagStatusBodySchema, req.body);
    const bag = await updateLaundryBagStatus(req.params.workId, req.params.bagId, body, getRequestPolicyContext(req));
    return sendSuccess(res, bag);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listLaundryBagsController,
  getLaundryBagController,
  createLaundryBagController,
  updateLaundryBagStatusController,
};
