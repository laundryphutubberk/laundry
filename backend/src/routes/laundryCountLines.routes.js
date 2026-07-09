const express = require('express');

const {
  listLaundryCountLinesController,
  createLaundryCountLineController,
} = require('../controllers/laundryCountLines.controller');

const router = express.Router({ mergeParams: true });

router.get('/', listLaundryCountLinesController);
router.post('/', createLaundryCountLineController);

module.exports = router;
