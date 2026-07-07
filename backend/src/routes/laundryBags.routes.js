const express = require('express');

const { sendSuccess } = require('../core/httpResponse');
const {
  listLaundryBags,
  getLaundryBagById,
  createLaundryBag,
} = require('../services/laundryBags.service');
const {
  parseRequest,
  listLaundryBagsQuerySchema,
  getLaundryBagQuerySchema,
  createLaundryBagBodySchema,
} = require('../validators/laundryBags.validator');

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res, next) => {
  try {
    const query = parseRequest(listLaundryBagsQuerySchema, req.query);
    const result = await listLaundryBags(req.params.workId, query);
    return sendSuccess(res, result.items, { pagination: result.pagination });
  } catch (error) {
    return next(error);
  }
});

router.get('/:bagId', async (req, res, next) => {
  try {
    const query = parseRequest(getLaundryBagQuerySchema, req.query);
    const bag = await getLaundryBagById(req.params.workId, req.params.bagId, query);
    return sendSuccess(res, bag);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = parseRequest(createLaundryBagBodySchema, req.body);
    const bag = await createLaundryBag(req.params.workId, body);
    return sendSuccess(res, bag, undefined, 201);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
