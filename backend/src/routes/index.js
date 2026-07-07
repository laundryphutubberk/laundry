const express = require('express');
const { sendSuccess } = require('../core/httpResponse');

const router = express.Router();

router.get('/health', function healthHandler(_req, res) {
  const payload = {
    status: 'ok',
    service: 'laundry-backend'
  };

  return sendSuccess(res, payload);
});

module.exports = router;
