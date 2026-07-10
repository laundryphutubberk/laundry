const express = require('express');

const {
  listLaundryWorkImagesController,
  createLaundryWorkImageController,
} = require('../controllers/laundryWorkImages.controller');

const router = express.Router({ mergeParams: true });

router.get('/', listLaundryWorkImagesController);
router.post('/', createLaundryWorkImageController);

module.exports = router;
