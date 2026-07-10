const express = require('express');

const {
  listLaundryWorksController,
  getLaundryWorkController,
  createLaundryWorkController,
  updateLaundryWorkStatusController,
  deleteLaundryWorkController,
} = require('../controllers/laundryWorks.controller');

const router = express.Router();

router.get('/', listLaundryWorksController);
router.get('/:workId', getLaundryWorkController);
router.post('/', createLaundryWorkController);
router.patch('/:workId/status', updateLaundryWorkStatusController);
router.delete('/:workId', deleteLaundryWorkController);

module.exports = router;
