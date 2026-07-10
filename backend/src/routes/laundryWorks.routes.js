const express = require('express');

const {
  listLaundryWorksController,
  getLaundryWorkController,
  createLaundryWorkController,
  updateLaundryWorkStatusController,
  deleteLaundryWorkController,
} = require('../controllers/laundryWorks.controller');
const {
  listLaundryIssuesController,
  createLaundryIssueController,
  updateLaundryIssueController,
  resolveLaundryIssueController,
} = require('../controllers/laundryIssues.controller');

const router = express.Router();

router.get('/', listLaundryWorksController);
router.post('/', createLaundryWorkController);
router.get('/:workId/issues', listLaundryIssuesController);
router.post('/:workId/issues', createLaundryIssueController);
router.patch('/issues/:issueId', updateLaundryIssueController);
router.patch('/issues/:issueId/resolve', resolveLaundryIssueController);
router.get('/:workId', getLaundryWorkController);
router.patch('/:workId/status', updateLaundryWorkStatusController);
router.delete('/:workId', deleteLaundryWorkController);

module.exports = router;
