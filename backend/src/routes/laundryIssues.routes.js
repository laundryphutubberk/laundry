const express = require('express');

const {
  listLaundryIssuesController,
  createLaundryIssueController,
} = require('../controllers/laundryIssues.controller');

const router = express.Router({ mergeParams: true });

router.get('/', listLaundryIssuesController);
router.post('/', createLaundryIssueController);

module.exports = router;
