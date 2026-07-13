const { sendSuccess } = require('../core/httpResponse');
const { getRequestPolicyContext } = require('../core/policyContext');
const {
  listLaundryWorks,
  getLaundryWorkById,
  createLaundryWork,
  updateLaundryWorkStatus,
  deleteOrCancelLaundryWork,
  confirmLaundryWorkSorting,
  recordLaundryWorkData,
  confirmLaundryWorkReturn,
  closeLaundryWork,
} = require('../services/laundryWorks.service');
const {
  parseRequest,
  workIdParamSchema,
  listLaundryWorksQuerySchema,
  getLaundryWorkQuerySchema,
  createLaundryWorkBodySchema,
  updateLaundryWorkStatusBodySchema,
  deleteLaundryWorkBodySchema,
  laundryWorkCommandBodySchema,
} = require('../validators/laundryWorks.validator');

const listLaundryWorksController = async (req, res, next) => {
  try {
    const query = parseRequest(listLaundryWorksQuerySchema, req.query);
    const result = await listLaundryWorks(query, getRequestPolicyContext(req));
    return sendSuccess(res, result.items, { pagination: result.pagination });
  } catch (error) {
    return next(error);
  }
};

const getLaundryWorkController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const query = parseRequest(getLaundryWorkQuerySchema, req.query);
    const work = await getLaundryWorkById(params.workId, query, getRequestPolicyContext(req));
    return sendSuccess(res, work);
  } catch (error) {
    return next(error);
  }
};

const createLaundryWorkController = async (req, res, next) => {
  try {
    const body = parseRequest(createLaundryWorkBodySchema, req.body);
    const work = await createLaundryWork(body, getRequestPolicyContext(req));
    return sendSuccess(res, work, undefined, 201);
  } catch (error) {
    return next(error);
  }
};

const updateLaundryWorkStatusController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const body = parseRequest(updateLaundryWorkStatusBodySchema, req.body);
    const work = await updateLaundryWorkStatus(params.workId, body, getRequestPolicyContext(req));
    return sendSuccess(res, work);
  } catch (error) {
    return next(error);
  }
};

const deleteLaundryWorkController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const body = parseRequest(deleteLaundryWorkBodySchema, req.body);
    const result = await deleteOrCancelLaundryWork(params.workId, body, getRequestPolicyContext(req));
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
};

const confirmLaundryWorkTypeSortingController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const body = parseRequest(laundryWorkCommandBodySchema, req.body);
    return sendSuccess(res, await confirmLaundryWorkSorting(params.workId, 'TYPE', body, getRequestPolicyContext(req)));
  } catch (error) { return next(error); }
};

const confirmLaundryWorkColorSortingController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const body = parseRequest(laundryWorkCommandBodySchema, req.body);
    return sendSuccess(res, await confirmLaundryWorkSorting(params.workId, 'COLOR', body, getRequestPolicyContext(req)));
  } catch (error) { return next(error); }
};

const recordLaundryWorkDataController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const body = parseRequest(laundryWorkCommandBodySchema, req.body);
    return sendSuccess(res, await recordLaundryWorkData(params.workId, body, getRequestPolicyContext(req)));
  } catch (error) { return next(error); }
};

const confirmLaundryWorkReturnController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const body = parseRequest(laundryWorkCommandBodySchema, req.body);
    return sendSuccess(res, await confirmLaundryWorkReturn(params.workId, body, getRequestPolicyContext(req)));
  } catch (error) { return next(error); }
};

const closeLaundryWorkController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const body = parseRequest(laundryWorkCommandBodySchema, req.body);
    return sendSuccess(res, await closeLaundryWork(params.workId, body, getRequestPolicyContext(req)));
  } catch (error) { return next(error); }
};

module.exports = {
  listLaundryWorksController,
  getLaundryWorkController,
  createLaundryWorkController,
  updateLaundryWorkStatusController,
  deleteLaundryWorkController,
  confirmLaundryWorkTypeSortingController,
  confirmLaundryWorkColorSortingController,
  recordLaundryWorkDataController,
  confirmLaundryWorkReturnController,
  closeLaundryWorkController,
};
