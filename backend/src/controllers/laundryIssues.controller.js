const { sendSuccess } = require('../core/httpResponse');
const { getRequestPolicyContext } = require('../core/policyContext');
const {
  listLaundryIssues,
  createLaundryIssue,
  updateLaundryIssue,
  resolveLaundryIssue,
} = require('../services/laundryIssues.service');
const {
  parseRequest,
  workIdParamSchema,
  issueIdParamSchema,
  listLaundryIssuesQuerySchema,
  createLaundryIssueBodySchema,
  updateLaundryIssueBodySchema,
  resolveLaundryIssueBodySchema,
} = require('../validators/laundryIssues.validator');

const listLaundryIssuesController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const query = parseRequest(listLaundryIssuesQuerySchema, req.query);
    const issues = await listLaundryIssues(params.workId, query, getRequestPolicyContext(req));
    return sendSuccess(res, issues);
  } catch (error) {
    return next(error);
  }
};

const createLaundryIssueController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const body = parseRequest(createLaundryIssueBodySchema, req.body);
    const issue = await createLaundryIssue(params.workId, body, getRequestPolicyContext(req));
    return sendSuccess(res, issue, undefined, 201);
  } catch (error) {
    return next(error);
  }
};

const updateLaundryIssueController = async (req, res, next) => {
  try {
    const params = parseRequest(issueIdParamSchema, req.params);
    const body = parseRequest(updateLaundryIssueBodySchema, req.body);
    const issue = await updateLaundryIssue(params.issueId, body, getRequestPolicyContext(req));
    return sendSuccess(res, issue);
  } catch (error) {
    return next(error);
  }
};

const resolveLaundryIssueController = async (req, res, next) => {
  try {
    const params = parseRequest(issueIdParamSchema, req.params);
    const body = parseRequest(resolveLaundryIssueBodySchema, req.body);
    const issue = await resolveLaundryIssue(params.issueId, body, getRequestPolicyContext(req));
    return sendSuccess(res, issue);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listLaundryIssuesController,
  createLaundryIssueController,
  updateLaundryIssueController,
  resolveLaundryIssueController,
};
