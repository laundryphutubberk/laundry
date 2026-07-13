const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { prisma } = require('../core/prisma');
const { logger } = require('../core/observability');
const { createGoogleIdentityVerificationService } = require('./googleIdentityVerification.service');

const TEN_MINUTES = 10 * 60 * 1000;
const FIVE_MINUTES = 5 * 60 * 1000;
const hash = (value) => crypto.createHash('sha256').update(value).digest('hex');
const secret = () => crypto.randomBytes(32).toString('base64url');
const fail = (code, message, statusCode = 409) => Object.assign(new Error(message), { code, statusCode });
const activeIntent = (intent, userId, context, now) => {
  if (!intent || intent.userId !== userId) throw fail('LINK_INTENT_NOT_FOUND', 'Link intent was not found', 404);
  if (intent.sessionContext !== context) throw fail('LINK_CONTEXT_MISMATCH', 'Authentication context changed', 401);
  if (intent.cancelledAt || intent.supersededAt || intent.consumedAt) throw fail('LINK_INTENT_TERMINAL', 'Link intent is no longer active');
  if (intent.expiresAt <= now) throw fail('LINK_INTENT_EXPIRED', 'Link intent has expired', 410);
};
const parseGrant = (raw) => {
  const index = raw.indexOf('.');
  if (index < 1) throw fail('STEP_UP_INVALID', 'Step-up grant is invalid', 401);
  return { id: raw.slice(0, index), value: raw.slice(index + 1) };
};
const verifyGrant = (grant, value, userId, purpose, targetId, context, now) => {
  if (!grant || grant.userId !== userId || grant.purpose !== purpose || grant.targetId !== targetId) throw fail('STEP_UP_INVALID', 'Step-up grant is invalid', 401);
  if (grant.sessionContext !== context) throw fail('STEP_UP_CONTEXT_MISMATCH', 'Authentication context changed', 401);
  if (grant.consumedAt) throw fail('STEP_UP_REPLAYED', 'Step-up grant was already used');
  if (grant.expiresAt <= now) throw fail('STEP_UP_EXPIRED', 'Step-up grant has expired', 410);
  const actual = Buffer.from(hash(value));
  const expected = Buffer.from(grant.secretHash);
  if (!crypto.timingSafeEqual(actual, expected)) throw fail('STEP_UP_INVALID', 'Step-up grant is invalid', 401);
};

const createIdentityLinkingService = ({ googleVerifier = createGoogleIdentityVerificationService() } = {}) => ({
  async validateContext(userId, context) {
    if (!context.startsWith('device:')) return;
    const id = context.slice('device:'.length);
    const session = await prisma.deviceSession.findFirst({ where: { id, userId } });
    const now = new Date();
    if (!session || session.revokedAt || session.idleExpiresAt <= now || session.absoluteExpiresAt <= now) throw fail('AUTH_SESSION_INVALID', 'Device session is no longer active', 401);
  },

  async createGoogleLinkIntent(userId, context, idToken) {
    await this.validateContext(userId, context);
    const verified = await googleVerifier.verify(idToken);
    const existing = await prisma.userIdentity.findUnique({ where: { provider_providerSubject: { provider: verified.provider, providerSubject: verified.providerSubject } } });
    if (existing?.userId !== undefined && existing.userId !== userId) {
      logger.security('auth.identity.link_conflict', { userId, provider: verified.provider });
      throw fail('IDENTITY_CONFLICT', 'Provider identity belongs to another User');
    }
    if (existing && !existing.unlinkedAt) throw fail('IDENTITY_ALREADY_LINKED', 'Provider identity is already linked');
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      await tx.identityLinkIntent.updateMany({
        where: { userId, provider: verified.provider, providerSubject: verified.providerSubject, consumedAt: null, cancelledAt: null, supersededAt: null },
        data: { supersededAt: now },
      });
      const intent = await tx.identityLinkIntent.create({ data: {
        userId, provider: verified.provider, providerSubject: verified.providerSubject,
        providerEmail: verified.verifiedEmail?.toLowerCase() || null, emailVerified: verified.emailVerified,
        displayName: verified.displayName, avatarUrl: verified.avatarUrl, sessionContext: context,
        expiresAt: new Date(now.getTime() + TEN_MINUTES),
      } });
      logger.security('auth.identity.link_intent_created', { userId, intentId: intent.id, provider: intent.provider });
      return { id: intent.id, expiresAt: intent.expiresAt, provider: intent.provider, email: intent.providerEmail, emailVerified: intent.emailVerified, displayName: intent.displayName, avatarUrl: intent.avatarUrl };
    });
  },

  async confirmLinkIntent(userId, context, intentId) {
    await this.validateContext(userId, context);
    const now = new Date();
    const intent = await prisma.identityLinkIntent.findUnique({ where: { id: intentId } });
    activeIntent(intent, userId, context, now);
    const result = await prisma.identityLinkIntent.updateMany({ where: { id: intentId, confirmedAt: null }, data: { confirmedAt: now } });
    if (result.count !== 1 && !intent.confirmedAt) throw fail('LINK_INTENT_TERMINAL', 'Link intent could not be confirmed');
    logger.security('auth.identity.link_confirmed', { userId, intentId });
    return { intentId, stepUpRequired: true, purpose: 'LINK_IDENTITY' };
  },

  async createPasswordGrant(userId, context, { password, purpose, targetId }) {
    await this.validateContext(userId, context);
    const now = new Date();
    const target = purpose === 'LINK_IDENTITY'
      ? await prisma.identityLinkIntent.findFirst({ where: { id: targetId, userId } })
      : await prisma.identityUnlinkIntent.findFirst({ where: { id: targetId, userId } });
    if (!target) throw fail('STEP_UP_TARGET_INVALID', 'Step-up target was not found', 404);
    if (purpose === 'LINK_IDENTITY') {
      activeIntent(target, userId, context, now);
      if (!target.confirmedAt) throw fail('LINK_CONFIRMATION_REQUIRED', 'Link intent requires confirmation');
    } else {
      if (target.sessionContext !== context) throw fail('STEP_UP_CONTEXT_MISMATCH', 'Authentication context changed', 401);
      if (target.cancelledAt || target.consumedAt) throw fail('UNLINK_INTENT_TERMINAL', 'Unlink intent is no longer active');
      if (target.expiresAt <= now) throw fail('UNLINK_INTENT_EXPIRED', 'Unlink intent has expired', 410);
    }
    const user = await prisma.user.findFirst({ where: { id: userId, active: true }, select: { passwordHash: true } });
    if (!user?.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
      if (purpose === 'LINK_IDENTITY') {
        await prisma.identityLinkIntent.update({
          where: { id: targetId },
          data: { attemptCount: { increment: 1 }, ...(target.attemptCount >= 4 ? { cancelledAt: now } : {}) },
        });
      }
      logger.security('auth.step_up.failed', { userId, purpose });
      throw fail('STEP_UP_FAILED', 'Password confirmation failed', 401);
    }
    const rawSecret = secret();
    const grant = await prisma.stepUpGrant.create({ data: { userId, purpose, targetId, secretHash: hash(rawSecret), sessionContext: context, expiresAt: new Date(Date.now() + FIVE_MINUTES) } });
    logger.security('auth.step_up.succeeded', { userId, purpose, targetId });
    return { grant: `${grant.id}.${rawSecret}`, expiresAt: grant.expiresAt };
  },

  async completeLink(userId, context, intentId, rawGrant) {
    await this.validateContext(userId, context);
    const now = new Date();
    const parsed = parseGrant(rawGrant);
    return prisma.$transaction(async (tx) => {
      const [intent, grant] = await Promise.all([tx.identityLinkIntent.findUnique({ where: { id: intentId } }), tx.stepUpGrant.findUnique({ where: { id: parsed.id } })]);
      activeIntent(intent, userId, context, now);
      if (!intent.confirmedAt) throw fail('LINK_CONFIRMATION_REQUIRED', 'Link intent requires confirmation');
      verifyGrant(grant, parsed.value, userId, 'LINK_IDENTITY', intentId, context, now);
      const consumeIntent = await tx.identityLinkIntent.updateMany({ where: { id: intentId, consumedAt: null, cancelledAt: null, supersededAt: null }, data: { consumedAt: now } });
      const consumeGrant = await tx.stepUpGrant.updateMany({ where: { id: grant.id, consumedAt: null }, data: { consumedAt: now } });
      if (consumeIntent.count !== 1) throw fail('LINK_INTENT_REPLAYED', 'Link intent was already consumed');
      if (consumeGrant.count !== 1) throw fail('STEP_UP_REPLAYED', 'Step-up grant was already used');
      const existing = await tx.userIdentity.findUnique({ where: { provider_providerSubject: { provider: intent.provider, providerSubject: intent.providerSubject } } });
      if (existing && existing.userId !== userId) throw fail('IDENTITY_CONFLICT', 'Provider identity belongs to another User');
      if (existing && !existing.unlinkedAt) throw fail('IDENTITY_ALREADY_LINKED', 'Provider identity is already linked');
      const snapshots = { providerEmail: intent.providerEmail, emailVerified: intent.emailVerified, displayName: intent.displayName, avatarUrl: intent.avatarUrl, unlinkedAt: null, linkedAt: now };
      const identity = existing
        ? await tx.userIdentity.update({ where: { id: existing.id }, data: snapshots })
        : await tx.userIdentity.create({ data: { userId, provider: intent.provider, providerSubject: intent.providerSubject, ...snapshots } });
      logger.security('auth.identity.linked', { userId, identityId: identity.id, provider: identity.provider });
      return { id: identity.id, provider: identity.provider, email: identity.providerEmail, displayName: identity.displayName, linkedAt: identity.linkedAt, active: true };
    });
  },

  async cancelLink(userId, context, intentId) {
    const intent = await prisma.identityLinkIntent.findUnique({ where: { id: intentId } });
    activeIntent(intent, userId, context, new Date());
    await prisma.identityLinkIntent.update({ where: { id: intentId }, data: { cancelledAt: new Date() } });
    logger.security('auth.identity.link_cancelled', { userId, intentId });
    return { cancelled: true };
  },

  async listIdentities(userId) {
    const items = await prisma.userIdentity.findMany({ where: { userId }, orderBy: { linkedAt: 'asc' } });
    const mask = (email) => email ? email.replace(/^(.).+(@.+)$/, '$1***$2') : null;
    return items.map((item) => ({ id: item.id, provider: item.provider, email: mask(item.providerEmail), displayName: item.displayName, avatarUrl: item.avatarUrl, linkedAt: item.linkedAt, lastUsedAt: item.lastUsedAt, active: !item.unlinkedAt }));
  },

  async createUnlinkIntent(userId, context, identityId) {
    await this.validateContext(userId, context);
    const identity = await prisma.userIdentity.findFirst({ where: { id: identityId, userId, unlinkedAt: null } });
    if (!identity) throw fail('IDENTITY_NOT_FOUND', 'Active identity was not found', 404);
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      await tx.identityUnlinkIntent.updateMany({ where: { userId, identityId, consumedAt: null, cancelledAt: null }, data: { cancelledAt: now } });
      const intent = await tx.identityUnlinkIntent.create({ data: { userId, identityId, sessionContext: context, expiresAt: new Date(now.getTime() + TEN_MINUTES) } });
      logger.security('auth.identity.unlink_requested', { userId, identityId, intentId: intent.id });
      return { id: intent.id, identityId, expiresAt: intent.expiresAt, stepUpRequired: true, purpose: 'UNLINK_IDENTITY' };
    });
  },

  async completeUnlink(userId, context, unlinkIntentId, rawGrant) {
    await this.validateContext(userId, context);
    const now = new Date();
    const parsed = parseGrant(rawGrant);
    return prisma.$transaction(async (tx) => {
      const [intent, grant] = await Promise.all([tx.identityUnlinkIntent.findUnique({ where: { id: unlinkIntentId } }), tx.stepUpGrant.findUnique({ where: { id: parsed.id } })]);
      if (!intent || intent.userId !== userId || intent.sessionContext !== context) throw fail('UNLINK_INTENT_NOT_FOUND', 'Unlink intent was not found', 404);
      if (intent.cancelledAt || intent.consumedAt) throw fail('UNLINK_INTENT_TERMINAL', 'Unlink intent is no longer active');
      if (intent.expiresAt <= now) throw fail('UNLINK_INTENT_EXPIRED', 'Unlink intent has expired', 410);
      verifyGrant(grant, parsed.value, userId, 'UNLINK_IDENTITY', unlinkIntentId, context, now);
      const [user, otherIdentityCount] = await Promise.all([
        tx.user.findUnique({ where: { id: userId }, select: { passwordHash: true } }),
        tx.userIdentity.count({ where: { userId, unlinkedAt: null, id: { not: intent.identityId } } }),
      ]);
      if (!user?.passwordHash && otherIdentityCount === 0) {
        logger.security('auth.identity.unlink_rejected', { userId, identityId: intent.identityId, reason: 'final_method' });
        throw fail('FINAL_AUTH_METHOD_REQUIRED', 'Cannot unlink the final usable authentication method');
      }
      const consumeIntent = await tx.identityUnlinkIntent.updateMany({ where: { id: unlinkIntentId, consumedAt: null, cancelledAt: null }, data: { consumedAt: now } });
      const consumeGrant = await tx.stepUpGrant.updateMany({ where: { id: grant.id, consumedAt: null }, data: { consumedAt: now } });
      if (consumeIntent.count !== 1 || consumeGrant.count !== 1) throw fail('UNLINK_REPLAYED', 'Unlink operation was already consumed');
      const identity = await tx.userIdentity.update({ where: { id: intent.identityId }, data: { unlinkedAt: now } });
      logger.security('auth.identity.unlinked', { userId, identityId: identity.id });
      return { id: identity.id, provider: identity.provider, active: false, unlinkedAt: identity.unlinkedAt };
    });
  },
});

module.exports = { createIdentityLinkingService };
