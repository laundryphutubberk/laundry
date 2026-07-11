const { sendSuccess } = require('../core/httpResponse');
const { getRequestPolicyContext } = require('../core/policyContext');
const {
  listLaundryCountLines,
  createLaundryCountLine,
  updateLaundryCountLine,
  deleteLaundryCountLine,
  completeLaundryCounting,
} = require('../services/laundryCountLines.service');
const {
  parseRequest,
  positiveIntParamSchema,
  countLineIdParamSchema,
  listLaundryCountLinesQuerySchema,
  createLaundryCountLineBodySchema,
  updateLaundryCountLineBodySchema,
  completeLaundryCountingBodySchema,
} = require('../validators/laundryCountLines.validator');

const listLaundryCountLinesController = async (req, res, next) => {
  try {
    const params = parseRequest(positiveIntParamSchema, req.params);
    const query = parseRequest(listLaundryCountLinesQuerySchema, req.query);
    const result = await listLaundryCountLines(params.workId, query, getRequestPolicyContext(req));
    return sendSuccess(res, result.items, { pagination: result.pagination });
  } catch (error) {
    return next(error);
  }
};

const createLaundryCountLineController = async (req, res, next) => {
  try {
    const params = parseRequest(positiveIntParamSchema, req.params);
    const body = parseRequest(createLaundryCountLineBodySchema, req.body);
    const countLine = await createLaundryCountLine(params.workId, body, getRequestPolicyContext(req));
    return sendSuccess(res, countLine, undefined, 201);
  } catch (error) {
    return next(error);
  }
};

const updateLaundryCountLineController = async (req, res, next) => {
  try {
    const params = parseRequest(countLineIdParamSchema, req.params);
    const body = parseRequest(updateLaundryCountLineBodySchema, req.body);
    const countLine = await updateLaundryCountLine(params.lineId, body, getRequestPolicyContext(req));
    return sendSuccess(res, countLine);
  } catch (error) {
    return next(error);
  }
};

const deleteLaundryCountLineController = async (req, res, next) => {
  try {
    const params = parseRequest(countLineIdParamSchema, req.params);
    const result = await deleteLaundryCountLine(params.lineId, getRequestPolicyContext(req));
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
};

const completeLaundryCountingController = async (req, res, next) => {
  try {
    const params = parseRequest(positiveIntParamSchema, req.params);
    const body = parseRequest(completeLaundryCountingBodySchema, req.body);
    const work = await completeLaundryCounting(params.workId, body, getRequestPolicyContext(req));
    return sendSuccess(res, work);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listLaundryCountLinesController,
  createLaundryCountLineController,
  updateLaundryCountLineController,
  deleteLaundryCountLineController,
  completeLaundryCountingController,
};
