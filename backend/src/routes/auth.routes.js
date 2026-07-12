const express = require('express');

const authController = require('../controllers/auth.controller');
const { authActorMiddleware } = require('../middlewares/authActor.middleware');

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/session/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post('/logout-all', authActorMiddleware, authController.logoutAll);
router.get('/sessions', authActorMiddleware, authController.listSessions);
router.post('/sessions/:id/revoke', authActorMiddleware, authController.revokeSession);

module.exports = router;
