const express = require('express');

const {
  listResortsController,
  createResortController,
  updateResortController,
} = require('../controllers/resorts.controller');

const router = express.Router();

router.get('/', listResortsController);
router.post('/', createResortController);
router.patch('/:resortId', updateResortController);

module.exports = router;
