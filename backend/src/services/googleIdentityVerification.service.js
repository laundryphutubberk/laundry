const { env } = require('../config/env');
const { logger } = require('../core/observability');
const { createGoogleIdentityAdapter, createVerificationError } = require('../integrations/googleIdentity.adapter');

const defaultAdapter = env.GOOGLE_IDENTITY_ENABLED
  ? createGoogleIdentityAdapter({ clientId: env.GOOGLE_CLIENT_ID })
  : null;

const createGoogleIdentityVerificationService = ({ adapter = defaultAdapter } = {}) => ({
  async verify(idToken) {
    if (!adapter) throw createVerificationError('PROVIDER_UNAVAILABLE', 'Google Identity verification is disabled', 503);

    try {
      const identity = await adapter.verifyIdToken(idToken);
      logger.security('auth.google.token_verified', {
        provider: identity.provider,
        providerSubject: identity.providerSubject,
        emailVerified: identity.emailVerified,
      });
      return identity;
    } catch (error) {
      logger.security('auth.google.verification_failed', { errorCode: error.code || 'INVALID_TOKEN' });
      throw error;
    }
  },
});

module.exports = {
  createGoogleIdentityVerificationService,
};
