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
const laundryWorkImagesRoutes = require('./laundryWorkImages.routes');
const laundryItemTypesRoutes = require('./laundryItemTypes.routes');
const laundryReportsRoutes = require('./laundryReports.routes');
const workspaceSettingsRoutes = require('./workspaceSettings.routes');
const {
  updateLaundryCountLineController,
  deleteLaundryCountLineController,
} = require('../controllers/laundryCountLines.controller');
const {
  updateLaundryIssueController,
  resolveLaundryIssueController,
  listGlobalLaundryIssuesController,
  reopenLaundryIssueController,
} = require('../controllers/laundryIssues.controller');
const {
  updateLaundryWorkImageController,
  setLaundryWorkImageCoverController,
  softDeleteLaundryWorkImageController,
} = require('../controllers/laundryWorkImages.controller');
const claims = require('../controllers/laundryClaims.controller');

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
router.use('/laundry/works/:workId/images', authActorMiddleware, laundryWorkImagesRoutes);
router.use('/laundry/item-types', authActorMiddleware, laundryItemTypesRoutes);
router.use('/laundry/reports', authActorMiddleware, laundryReportsRoutes);
router.use('/laundry/settings', authActorMiddleware, workspaceSettingsRoutes);
router.patch('/laundry/count-lines/:lineId', authActorMiddleware, updateLaundryCountLineController);
router.delete('/laundry/count-lines/:lineId', authActorMiddleware, deleteLaundryCountLineController);
router.patch('/laundry/issues/:issueId', authActorMiddleware, updateLaundryIssueController);
router.patch('/laundry/issues/:issueId/resolve', authActorMiddleware, resolveLaundryIssueController);
router.get('/laundry/issues', authActorMiddleware, listGlobalLaundryIssuesController);
router.patch('/laundry/issues/:issueId/reopen', authActorMiddleware, reopenLaundryIssueController);
router.patch('/laundry/images/:imageId', authActorMiddleware, updateLaundryWorkImageController);
router.patch('/laundry/images/:imageId/cover', authActorMiddleware, setLaundryWorkImageCoverController);
router.delete('/laundry/images/:imageId', authActorMiddleware, softDeleteLaundryWorkImageController);
router.use('/laundry/works', authActorMiddleware, laundryWorksRoutes);
router.get('/laundry/works/:workId/claims', authActorMiddleware, claims.list);
router.get('/laundry/claims/:claimId', authActorMiddleware, claims.detail);
router.post('/laundry/issues/:issueId/claim', authActorMiddleware, claims.create);
router.post('/laundry/claims/:claimId/start-review', authActorMiddleware, claims.startReview);
router.post('/laundry/claims/:claimId/approve', authActorMiddleware, claims.approve);
router.post('/laundry/claims/:claimId/reject', authActorMiddleware, claims.reject);
router.post('/laundry/claims/:claimId/resolve', authActorMiddleware, claims.resolve);

module.exports = router;
