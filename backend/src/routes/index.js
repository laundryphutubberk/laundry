const express = require('express');
const { getHealthStatus } = require('../core/health');
const { sendSuccess } = require('../core/httpResponse');

const router = express.Router();

router.get('/health', async function healthHandler(_req, res, next) {
  try {
    const healthStatus = await getHealthStatus();
    return sendSuccess(res, healthStatus);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
