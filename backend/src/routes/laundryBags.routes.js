const express = require('express');

const {
  listLaundryBagsController,
  getLaundryBagController,
  createLaundryBagController,
  updateLaundryBagStatusController,
} = require('../controllers/laundryBags.controller');

const router = express.Router({ mergeParams: true });

router.get('/', listLaundryBagsController);
router.get('/:bagId', getLaundryBagController);
router.post('/', createLaundryBagController);
router.patch('/:bagId/status', updateLaundryBagStatusController);

module.exports = router;
