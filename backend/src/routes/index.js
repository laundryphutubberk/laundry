const express = require('express');

const { getHealthStatus } = require('../core/health');
const { sendSuccess } = require('../core/httpResponse');
const { authActorMiddleware } = require('../middlewares/authActor.middleware');
const authRoutes = require('./auth.routes');
const resortsRoutes = require('./resorts.routes');
const laundryWorksRoutes = require('./laundryWorks.routes');
const laundryBagsRoutes = require('./laundryBags.routes');
const laundryCountLinesRoutes = require('./laundryCountLines.routes');
const laundryIssuesRoutes = require('./laundryIssues.routes');
const {
  updateLaundryCountLineController,
  deleteLaundryCountLineController,
} = require('../controllers/laundryCountLines.controller');
const {
  updateLaundryIssueController,
  resolveLaundryIssueController,
} = require('../controllers/laundryIssues.controller');

const router = express.Router();

router.get('/health', async function healthHandler(_req, res, next) {
  try {
    const healthStatus = await getHealthStatus();
    return sendSuccess(res, healthStatus);
  } catch (error) {
    return next(error);
  }
});

router.use('/auth', authRoutes);
router.use('/resorts', authActorMiddleware, resortsRoutes);
router.use('/laundry/works/:workId/bags', authActorMiddleware, laundryBagsRoutes);
router.use('/laundry/works/:workId/count-lines', authActorMiddleware, laundryCountLinesRoutes);
router.use('/laundry/works/:workId/issues', authActorMiddleware, laundryIssuesRoutes);
router.patch('/laundry/count-lines/:lineId', authActorMiddleware, updateLaundryCountLineController);
router.delete('/laundry/count-lines/:lineId', authActorMiddleware, deleteLaundryCountLineController);
router.patch('/laundry/issues/:issueId', authActorMiddleware, updateLaundryIssueController);
router.patch('/laundry/issues/:issueId/resolve', authActorMiddleware, resolveLaundryIssueController);
router.use('/laundry/works', authActorMiddleware, laundryWorksRoutes);

module.exports = router;
