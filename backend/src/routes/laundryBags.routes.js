const express = require('express');

const {
  listLaundryBagsController,
  getLaundryBagController,
  createLaundryBagController,
} = require('../controllers/laundryBags.controller');

const router = express.Router({ mergeParams: true });

router.get('/', listLaundryBagsController);
router.get('/:bagId', getLaundryBagController);
router.post('/', createLaundryBagController);

module.exports = router;
