const express = require('express');

const { getHealthStatus } = require('../core/health');
const { sendSuccess } = require('../core/httpResponse');
const laundryWorksRoutes = require('./laundryWorks.routes');

const router = express.Router();

router.get('/health', async function healthHandler(_req, res, next) {
  try {
    const healthStatus = await getHealthStatus();
    return sendSuccess(res, healthStatus);
  } catch (error) {
    return next(error);
  }
});

router.use('/laundry/works', laundryWorksRoutes);

module.exports = router;
