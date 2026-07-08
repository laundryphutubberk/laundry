const express = require('express');

const { getHealthStatus } = require('../core/health');
const { sendSuccess } = require('../core/httpResponse');
const { authActorMiddleware } = require('../middlewares/authActor.middleware');
const laundryWorksRoutes = require('./laundryWorks.routes');
const laundryBagsRoutes = require('./laundryBags.routes');

const router = express.Router();

router.get('/health', async function healthHandler(_req, res, next) {
  try {
    const healthStatus = await getHealthStatus();
    return sendSuccess(res, healthStatus);
  } catch (error) {
    return next(error);
  }
});

router.use('/laundry/works/:workId/bags', authActorMiddleware, laundryBagsRoutes);
router.use('/laundry/works', authActorMiddleware, laundryWorksRoutes);

module.exports = router;
