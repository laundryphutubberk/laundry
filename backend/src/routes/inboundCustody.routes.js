const express = require('express');

const {
  getCustodyController,
  initiateCustodyController,
  confirmReceiptController,
  recordCountEvidenceController,
  closeCustodyController,
} = require('../controllers/inboundCustody.controller');

const router = express.Router();

router.get('/:workId/custody', getCustodyController);
router.post('/:workId/custody/initiate', initiateCustodyController);
router.post('/:workId/custody/confirm-receipt', confirmReceiptController);
router.post('/:workId/custody/record-count-evidence', recordCountEvidenceController);
router.post('/:workId/custody/close', closeCustodyController);

module.exports = router;
