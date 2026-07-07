const express = require('express');

const { sendSuccess } = require('../core/httpResponse');
const {
  listLaundryWorks,
  getLaundryWorkById,
  createLaundryWork,
  updateLaundryWorkStatus,
} = require('../services/laundryWorks.service');

const router = express.Router();

router.get('/', async function listLaundryWorksHandler(req, res, next) {
  try {
    const result = await listLaundryWorks(req.query);
    return sendSuccess(res, result.items, { pagination: result.pagination });
  } catch (error) {
    return next(error);
  }
});

router.get('/:workId', async function getLaundryWorkHandler(req, res, next) {
  try {
    const work = await getLaundryWorkById(req.params.workId, req.query);
    return sendSuccess(res, work);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async function createLaundryWorkHandler(req, res, next) {
  try {
    const work = await createLaundryWork(req.body);
    return sendSuccess(res, work, undefined, 201);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:workId/status', async function updateLaundryWorkStatusHandler(req, res, next) {
  try {
    const work = await updateLaundryWorkStatus(req.params.workId, req.body);
    return sendSuccess(res, work);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
