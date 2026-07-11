const express = require('express');

const {
  listLaundryWorkImagesController,
  createLaundryWorkImageController,
} = require('../controllers/laundryWorkImages.controller');

const router = express.Router({ mergeParams: true });
const { parseLaundryImageUpload } = require('../middlewares/laundryImageUpload.middleware');

router.get('/', listLaundryWorkImagesController);
router.post('/', parseLaundryImageUpload, createLaundryWorkImageController);

module.exports = router;
