const express = require('express');

const authController = require('../controllers/auth.controller');
const { authActorMiddleware } = require('../middlewares/authActor.middleware');
const identityLinkingController = require('../controllers/identityLinking.controller');
const { createAuthRateLimit } = require('../middlewares/authRateLimit.middleware');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/session/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/logout-all', authActorMiddleware, authController.logoutAll);
router.get('/sessions', authActorMiddleware, authController.listSessions);
router.post('/sessions/:id/revoke', authActorMiddleware, authController.revokeSession);
router.post('/identities/google/link-intents', authActorMiddleware, createAuthRateLimit({ limit: 10, key: 'google-link-intent' }), identityLinkingController.createGoogleIntent);
router.post('/identities/google/link-intents/:intentId/confirm', authActorMiddleware, identityLinkingController.confirmGoogleIntent);
router.post('/identities/google/link-intents/:intentId/complete', authActorMiddleware, identityLinkingController.completeGoogleIntent);
router.post('/identities/google/link-intents/:intentId/cancel', authActorMiddleware, identityLinkingController.cancelGoogleIntent);
router.post('/step-up/password', authActorMiddleware, createAuthRateLimit({ limit: 5, key: 'password-step-up' }), identityLinkingController.createPasswordStepUp);
router.get('/identities', authActorMiddleware, identityLinkingController.listIdentities);
router.post('/identities/:identityId/unlink-intents', authActorMiddleware, identityLinkingController.createUnlinkIntent);
router.post('/identities/unlink-intents/:intentId/complete', authActorMiddleware, identityLinkingController.completeUnlinkIntent);

module.exports = router;
