const express = require('express');
const {
  listLaundryItemTypesController,
  createLaundryItemTypeController,
  updateLaundryItemTypeController,
} = require('../controllers/laundryItemTypes.controller');

const router = express.Router();
router.get('/', listLaundryItemTypesController);
router.post('/', createLaundryItemTypeController);
router.patch('/:itemTypeId', updateLaundryItemTypeController);

module.exports = router;
