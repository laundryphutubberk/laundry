const express = require('express');

const router = express.Router();

router.get('/health', function healthHandler(_req, res) {
  return res.status(200).json({
    status: 'ok',
    service: 'laundry-backend'
  });
});

module.exports = router;
