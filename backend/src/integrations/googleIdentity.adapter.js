const { OAuth2Client } = require('google-auth-library');

const GOOGLE_ISSUERS = new Set(['accounts.google.com', 'https://accounts.google.com']);

const createVerificationError = (code, message, statusCode = 401) => Object.assign(new Error(message), {
  code,
  statusCode,
});

const normalizeProviderError = (error) => {
  if (error?.code === 'ENOTFOUND' || error?.code === 'ETIMEDOUT' || error?.code === 'ECONNRESET' || error?.statusCode >= 500) {
    return createVerificationError('PROVIDER_UNAVAILABLE', 'Google Identity verification is temporarily unavailable', 503);
  }

  const message = String(error?.message || '').toLowerCase();
  if (message.includes('expired')) return createVerificationError('TOKEN_EXPIRED', 'Google ID token has expired');
  if (message.includes('audience')) return createVerificationError('INVALID_AUDIENCE', 'Google ID token audience is invalid');
  if (message.includes('issuer')) return createVerificationError('INVALID_ISSUER', 'Google ID token issuer is invalid');
  return createVerificationError('INVALID_TOKEN', 'Google ID token is invalid');
};

const assertPayload = (payload, clientId, nowSeconds) => {
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(clientId)) throw createVerificationError('INVALID_AUDIENCE', 'Google ID token audience is invalid');
  if (!GOOGLE_ISSUERS.has(payload.iss)) throw createVerificationError('INVALID_ISSUER', 'Google ID token issuer is invalid');
  if (!payload.exp || payload.exp <= nowSeconds) throw createVerificationError('TOKEN_EXPIRED', 'Google ID token has expired');
  if (!payload.sub) throw createVerificationError('INVALID_TOKEN', 'Google ID token subject is missing');
};

const createGoogleIdentityAdapter = ({ clientId, oauthClient = new OAuth2Client(clientId), now = () => Date.now() }) => ({
  async verifyIdToken(idToken) {
    if (!clientId) throw createVerificationError('PROVIDER_UNAVAILABLE', 'Google Identity verification is not configured', 503);
    if (!idToken || typeof idToken !== 'string') throw createVerificationError('INVALID_TOKEN', 'Google ID token is required');

    try {
      const ticket = await oauthClient.verifyIdToken({ idToken, audience: clientId });
      const payload = ticket.getPayload();
      if (!payload) throw createVerificationError('INVALID_TOKEN', 'Google ID token payload is missing');
      assertPayload(payload, clientId, Math.floor(now() / 1000));

      return {
        provider: 'GOOGLE',
        providerSubject: payload.sub,
        verifiedEmail: payload.email || null,
        emailVerified: payload.email_verified === true,
        displayName: payload.name || null,
        avatarUrl: payload.picture || null,
      };
    } catch (error) {
      if (error?.code && ['INVALID_TOKEN', 'TOKEN_EXPIRED', 'INVALID_AUDIENCE', 'INVALID_ISSUER', 'PROVIDER_UNAVAILABLE'].includes(error.code)) throw error;
      throw normalizeProviderError(error);
    }
  },
});

module.exports = {
  createGoogleIdentityAdapter,
  createVerificationError,
  normalizeProviderError,
};
