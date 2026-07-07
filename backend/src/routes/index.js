const express = require('express');
const { getHealthStatus } = require('../core/health');
const { sendSuccess } = require('../core/httpResponse');

const router = express.Router();

router.get('/health', function healthHandler(_req, res) {
  return sendSuccess(res, getHealthStatus());
});

module.exports = router;
