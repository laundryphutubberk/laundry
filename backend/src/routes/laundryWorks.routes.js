const express = require('express');

const { sendSuccess } = require('../core/httpResponse');
const {
  listLaundryWorks,
  getLaundryWorkById,
  createLaundryWork,
  updateLaundryWorkStatus,
} = require('../services/laundryWorks.service');
const {
  parseRequest,
  workIdParamSchema,
  listLaundryWorksQuerySchema,
  getLaundryWorkQuerySchema,
  createLaundryWorkBodySchema,
  updateLaundryWorkStatusBodySchema,
} = require('../validators/laundryWorks.validator');

const router = express.Router();

router.get('/', async function listLaundryWorksHandler(req, res, next) {
  try {
    const query = parseRequest(listLaundryWorksQuerySchema, req.query);
    const result = await listLaundryWorks(query);
    return sendSuccess(res, result.items, { pagination: result.pagination });
  } catch (error) {
    return next(error);
  }
});

router.get('/:workId', async function getLaundryWorkHandler(req, res, next) {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const query = parseRequest(getLaundryWorkQuerySchema, req.query);
    const work = await getLaundryWorkById(params.workId, query);
    return sendSuccess(res, work);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async function createLaundryWorkHandler(req, res, next) {
  try {
    const body = parseRequest(createLaundryWorkBodySchema, req.body);
    const work = await createLaundryWork(body);
    return sendSuccess(res, work, undefined, 201);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:workId/status', async function updateLaundryWorkStatusHandler(req, res, next) {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const body = parseRequest(updateLaundryWorkStatusBodySchema, req.body);
    const work = await updateLaundryWorkStatus(params.workId, body);
    return sendSuccess(res, work);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
