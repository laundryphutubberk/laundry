const express = require('express');

const {
  listLaundryWorksController,
  getLaundryWorkController,
  createLaundryWorkController,
  updateLaundryWorkStatusController,
} = require('./laundry-work.controller');

const router = express.Router();

router.get('/', listLaundryWorksController);
router.get('/:workId', getLaundryWorkController);
router.post('/', createLaundryWorkController);
router.patch('/:workId/status', updateLaundryWorkStatusController);

module.exports = router;
