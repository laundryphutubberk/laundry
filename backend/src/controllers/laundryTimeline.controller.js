const { sendSuccess } = require('../core/httpResponse');
const { getRequestPolicyContext } = require('../core/policyContext');
const { getLaundryWorkTimeline } = require('../services/laundryTimeline.service');
const { parseRequest, workIdParamSchema } = require('../validators/laundryWorks.validator');
const getLaundryWorkTimelineController = async (req, res, next) => { try { const { workId } = parseRequest(workIdParamSchema, req.params); return sendSuccess(res, await getLaundryWorkTimeline(workId, getRequestPolicyContext(req))); } catch (error) { return next(error); } };
module.exports = { getLaundryWorkTimelineController };
