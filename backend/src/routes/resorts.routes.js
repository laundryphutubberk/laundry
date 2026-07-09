const express = require('express');

const {
  listResortsController,
  createResortController,
} = require('../controllers/resorts.controller');

const router = express.Router();

router.get('/', listResortsController);
router.post('/', createResortController);

module.exports = router;
