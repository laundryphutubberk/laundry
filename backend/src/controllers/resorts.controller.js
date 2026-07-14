const { sendSuccess } = require('../core/httpResponse');
const { getRequestPolicyContext } = require('../core/policyContext');
const resortsService = require('../services/resorts.service');
const {
  parseRequest,
  listResortsQuerySchema,
  createResortBodySchema,
  resortIdParamSchema,
  updateResortBodySchema,
} = require('../validators/resorts.validator');

const listResortsController = async (req, res, next) => {
  try {
    const query = parseRequest(listResortsQuerySchema, req.query);
    const result = await resortsService.listResorts(query, getRequestPolicyContext(req));
    return sendSuccess(res, result.items, { pagination: result.pagination });
  } catch (error) {
    return next(error);
  }
};

const createResortController = async (req, res, next) => {
  try {
    const body = parseRequest(createResortBodySchema, req.body);
    const resort = await resortsService.createResort(body, getRequestPolicyContext(req));
    return sendSuccess(res, resort, undefined, 201);
  } catch (error) {
    return next(error);
  }
};

const updateResortController = async (req, res, next) => {
  try {
    const { resortId } = parseRequest(resortIdParamSchema, req.params);
    const body = parseRequest(updateResortBodySchema, req.body);
    const resort = await resortsService.updateResort(resortId, body, getRequestPolicyContext(req));
    return sendSuccess(res, resort);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listResortsController,
  createResortController,
  updateResortController,
};
