const assert = require('assert/strict');
const { spawnSync } = require('child_process');
const { createGoogleIdentityAdapter } = require('../src/integrations/googleIdentity.adapter');
const { createGoogleIdentityVerificationService } = require('../src/services/googleIdentityVerification.service');

const CLIENT_ID = 'verification-client.apps.googleusercontent.com';
const NOW = 1_800_000_000_000;
const nowSeconds = Math.floor(NOW / 1000);

const payload = (overrides = {}) => ({
  sub: 'google-subject-123',
  aud: CLIENT_ID,
  iss: 'https://accounts.google.com',
  exp: nowSeconds + 300,
  email: 'verified@example.test',
  email_verified: true,
  name: 'Verified Person',
  picture: 'https://example.test/avatar.png',
  ...overrides,
});

const adapterFor = (result) => createGoogleIdentityAdapter({
  clientId: CLIENT_ID,
  now: () => NOW,
  oauthClient: {
    async verifyIdToken() {
      if (result instanceof Error) throw result;
      return { getPayload: () => result };
    },
  },
});

const expectCode = async (adapter, code) => {
  await assert.rejects(() => adapter.verifyIdToken('opaque-id-token'), (error) => error.code === code && error.statusCode < 500);
};

async function main() {
  const validAdapter = adapterFor(payload());
  const service = createGoogleIdentityVerificationService({ adapter: validAdapter });
  assert.deepEqual(await service.verify('opaque-id-token'), {
    provider: 'GOOGLE',
    providerSubject: 'google-subject-123',
    verifiedEmail: 'verified@example.test',
    emailVerified: true,
    displayName: 'Verified Person',
    avatarUrl: 'https://example.test/avatar.png',
  });

  await expectCode(adapterFor(payload({ exp: nowSeconds - 1 })), 'TOKEN_EXPIRED');
  await expectCode(adapterFor(payload({ aud: 'wrong-client.apps.googleusercontent.com' })), 'INVALID_AUDIENCE');
  await expectCode(adapterFor(payload({ iss: 'https://invalid.example.test' })), 'INVALID_ISSUER');
  await expectCode(adapterFor(new Error('Malformed token')), 'INVALID_TOKEN');

  const unavailable = Object.assign(new Error('Provider network unavailable'), { code: 'ENOTFOUND' });
  await assert.rejects(
    () => adapterFor(unavailable).verifyIdToken('opaque-id-token'),
    (error) => error.code === 'PROVIDER_UNAVAILABLE' && error.statusCode === 503,
  );

  const disabledService = createGoogleIdentityVerificationService({ adapter: null });
  await assert.rejects(() => disabledService.verify('opaque-id-token'), (error) => error.code === 'PROVIDER_UNAVAILABLE');

  const invalidConfig = spawnSync(process.execPath, ['-e', "require('./src/config/env')"], {
    cwd: process.cwd(),
    env: { ...process.env, GOOGLE_IDENTITY_ENABLED: 'true', GOOGLE_CLIENT_ID: '' },
    encoding: 'utf8',
  });
  assert.notEqual(invalidConfig.status, 0);
  assert.match(`${invalidConfig.stdout}${invalidConfig.stderr}`, /GOOGLE_CLIENT_ID is required/);

  console.log('AUTH_GOOGLE_VERIFICATION_FOUNDATION=PASS');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
