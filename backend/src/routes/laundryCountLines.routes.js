const express = require('express');

const {
  listLaundryCountLinesController,
  createLaundryCountLineController,
  completeLaundryCountingController,
} = require('../controllers/laundryCountLines.controller');

const router = express.Router({ mergeParams: true });

router.get('/', listLaundryCountLinesController);
router.post('/', createLaundryCountLineController);
router.post('/complete', completeLaundryCountingController);

module.exports = router;
