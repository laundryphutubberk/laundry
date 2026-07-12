const crypto = require('crypto');
const { sendSuccess } = require('../core/httpResponse');
const { logger } = require('../core/observability');
const { readCookie } = require('./auth.controller');
const { createIdentityLinkingService } = require('../services/identityLinking.service');
const { validateGoogleIntent, validateStepUp, validateCompletion } = require('../validators/identityLinking.validator');

const service = createIdentityLinkingService();
const contextFor = (req) => {
  const cookie = readCookie(req);
  if (cookie) return `device:${cookie.split('.')[0]}`;
  const bearer = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return `access:${crypto.createHash('sha256').update(bearer).digest('hex')}`;
};
const run = (handler) => async (req, res, next) => {
  try { return await handler(req, res); } catch (error) {
    if (/EXPIRED|REPLAY|TERMINAL/.test(error.code || '')) {
      logger.security('auth.identity.intent_or_grant_rejected', { userId: req.actor?.userId, errorCode: error.code });
    }
    return next(error);
  }
};

const createGoogleIntent = run(async (req, res) => sendSuccess(res, await service.createGoogleLinkIntent(req.actor.userId, contextFor(req), validateGoogleIntent(req.body).idToken), undefined, 201));
const confirmGoogleIntent = run(async (req, res) => sendSuccess(res, await service.confirmLinkIntent(req.actor.userId, contextFor(req), req.params.intentId)));
const completeGoogleIntent = run(async (req, res) => sendSuccess(res, await service.completeLink(req.actor.userId, contextFor(req), req.params.intentId, validateCompletion(req.body).grant)));
const cancelGoogleIntent = run(async (req, res) => sendSuccess(res, await service.cancelLink(req.actor.userId, contextFor(req), req.params.intentId)));
const createPasswordStepUp = run(async (req, res) => sendSuccess(res, await service.createPasswordGrant(req.actor.userId, contextFor(req), validateStepUp(req.body)), undefined, 201));
const listIdentities = run(async (req, res) => sendSuccess(res, { items: await service.listIdentities(req.actor.userId) }));
const createUnlinkIntent = run(async (req, res) => sendSuccess(res, await service.createUnlinkIntent(req.actor.userId, contextFor(req), req.params.identityId), undefined, 201));
const completeUnlinkIntent = run(async (req, res) => sendSuccess(res, await service.completeUnlink(req.actor.userId, contextFor(req), req.params.intentId, validateCompletion(req.body).grant)));

module.exports = { cancelGoogleIntent, completeGoogleIntent, completeUnlinkIntent, confirmGoogleIntent, createGoogleIntent, createPasswordStepUp, createUnlinkIntent, listIdentities };
