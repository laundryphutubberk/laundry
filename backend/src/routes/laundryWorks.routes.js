const express = require('express');

const {
  listLaundryWorksController,
  getLaundryWorkController,
  createLaundryWorkController,
  updateLaundryWorkStatusController,
  deleteLaundryWorkController,
  confirmLaundryWorkTypeSortingController,
  confirmLaundryWorkColorSortingController,
  recordLaundryWorkDataController,
  confirmLaundryWorkReturnController,
  closeLaundryWorkController,
} = require('../controllers/laundryWorks.controller');

const router = express.Router();
const { getLaundryWorkTimelineController } = require('../controllers/laundryTimeline.controller');

router.get('/', listLaundryWorksController);
router.get('/:workId', getLaundryWorkController);
router.get('/:workId/timeline', getLaundryWorkTimelineController);
router.post('/', createLaundryWorkController);
router.patch('/:workId/status', updateLaundryWorkStatusController);
router.post('/:workId/confirm-type-sorting', confirmLaundryWorkTypeSortingController);
router.post('/:workId/confirm-color-sorting', confirmLaundryWorkColorSortingController);
router.post('/:workId/record-data', recordLaundryWorkDataController);
router.post('/:workId/confirm-return', confirmLaundryWorkReturnController);
router.post('/:workId/close', closeLaundryWorkController);
router.delete('/:workId', deleteLaundryWorkController);

module.exports = router;
