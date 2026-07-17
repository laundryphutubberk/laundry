const { sendSuccess } = require('../core/httpResponse');
const { getRequestPolicyContext } = require('../core/policyContext');
const {
  getCustodyByWorkId,
  initiateCustody,
  confirmReceipt,
  recordCountEvidence,
  closeCustody,
} = require('../services/inboundCustody.service');
const {
  parseRequest,
  workIdParamSchema,
  confirmReceiptBodySchema,
  recordCountEvidenceBodySchema,
} = require('../validators/inboundCustody.validator');

const getCustodyController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const result = await getCustodyByWorkId(params.workId, getRequestPolicyContext(req));
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
};

const initiateCustodyController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const custody = await initiateCustody(params.workId, getRequestPolicyContext(req));
    return sendSuccess(res, custody, undefined, 201);
  } catch (error) {
    return next(error);
  }
};

const confirmReceiptController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const body = parseRequest(confirmReceiptBodySchema, req.body);
    const custody = await confirmReceipt(params.workId, body, getRequestPolicyContext(req));
    return sendSuccess(res, custody);
  } catch (error) {
    return next(error);
  }
};

const recordCountEvidenceController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const body = parseRequest(recordCountEvidenceBodySchema, req.body);
    const custody = await recordCountEvidence(params.workId, body, getRequestPolicyContext(req));
    return sendSuccess(res, custody);
  } catch (error) {
    return next(error);
  }
};

const closeCustodyController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const custody = await closeCustody(params.workId, getRequestPolicyContext(req));
    return sendSuccess(res, custody);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getCustodyController,
  initiateCustodyController,
  confirmReceiptController,
  recordCountEvidenceController,
  closeCustodyController,
};
