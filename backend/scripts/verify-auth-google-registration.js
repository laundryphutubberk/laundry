const assert = require('assert/strict');
const { prisma } = require('../src/core/prisma');
const { env } = require('../src/config/env');
const authRepository = require('../src/repositories/auth.repository');
const { validateGoogleRegisterInput } = require('../src/validators/googleRegister.validator');
const { createAuthRateLimit } = require('../src/middlewares/authRateLimit.middleware');
const fs = require('fs');
const { spawnSync } = require('child_process');

const verificationPath = require.resolve('../src/services/googleIdentityVerification.service');
const authServicePath = require.resolve('../src/services/auth.service');
let currentClaims;
require.cache[verificationPath] = {
  id: verificationPath,
  filename: verificationPath,
  loaded: true,
  exports: { createGoogleIdentityVerificationService: () => ({ verify: async () => currentClaims }) },
};
delete require.cache[authServicePath];
const authService = require('../src/services/auth.service');

const marker = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
const trackedEmails = [];
const claims = (suffix, overrides = {}) => ({
  provider: 'GOOGLE',
  providerSubject: `register-subject-${marker}-${suffix}`,
  verifiedEmail: `register-${marker}-${suffix}@example.test`,
  emailVerified: true,
  displayName: 'Registration Verify',
  avatarUrl: 'https://example.test/avatar.png',
  ...overrides,
});
const expectCode = async (promise, code, statusCode) => assert.rejects(promise, (error) => error.code === code && error.statusCode === statusCode);

async function run() {
  const originalMode = env.AUTH_GOOGLE_REGISTRATION_MODE;
  let server;
  const baseline = await Promise.all([
    prisma.tenant.count(), prisma.laundryWorkspace.count(), prisma.branch.count(), prisma.tenantMembership.count(),
  ]);
  try {
    assert.deepEqual(validateGoogleRegisterInput({ idToken: 'opaque' }), { idToken: 'opaque', rememberDevice: false });
    assert.throws(() => validateGoogleRegisterInput({ idToken: 'opaque', providerSubject: 'forbidden' }));
    assert.throws(() => validateGoogleRegisterInput({ idToken: 'opaque', deviceLabel: 'x'.repeat(121) }));

    const routeSource = fs.readFileSync(require.resolve('../src/routes/auth.routes'), 'utf8');
    const controllerSource = fs.readFileSync(require.resolve('../src/controllers/auth.controller'), 'utf8');
    assert.match(routeSource, /google\/register'.*limit: 5, key: 'google-register'/);
    assert.match(controllerSource, /publicSession\(session\).*201/);
    assert.doesNotMatch(controllerSource, /providerSubject|idToken/);

    const limiter = createAuthRateLimit({ limit: 5, key: `google-register-verify-${marker}` });
    const limiterErrors = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      limiter({ ip: '203.0.113.1' }, null, (error) => limiterErrors.push(error));
    }
    assert.equal(limiterErrors.slice(0, 5).every((error) => error === undefined), true);
    assert.equal(limiterErrors[5]?.code, 'AUTH_RATE_LIMITED');

    const envScript = "const { env } = require('./src/config/env'); process.stdout.write(env.AUTH_GOOGLE_REGISTRATION_MODE)";
    const defaultEnvironment = { ...process.env };
    delete defaultEnvironment.AUTH_GOOGLE_REGISTRATION_MODE;
    const devEnv = spawnSync(process.execPath, ['-e', envScript], { cwd: process.cwd(), env: { ...defaultEnvironment, NODE_ENV: 'test' }, encoding: 'utf8' });
    const productionEnv = spawnSync(process.execPath, ['-e', envScript], { cwd: process.cwd(), env: { ...defaultEnvironment, NODE_ENV: 'production' }, encoding: 'utf8' });
    assert.equal(devEnv.status, 0);
    assert.equal(productionEnv.status, 0);
    assert.ok(devEnv.stdout.trim().endsWith('PUBLIC_LAUNDRY_ONBOARDING'));
    assert.ok(productionEnv.stdout.trim().endsWith('DISABLED'));

    currentClaims = claims('mode');
    env.AUTH_GOOGLE_REGISTRATION_MODE = 'DISABLED';
    await expectCode(authService.googleRegister({ idToken: 'opaque' }), 'GOOGLE_REGISTRATION_DISABLED', 403);
    env.AUTH_GOOGLE_REGISTRATION_MODE = 'INVITATION_ONLY';
    await expectCode(authService.googleRegister({ idToken: 'opaque' }), 'GOOGLE_REGISTRATION_INVITATION_REQUIRED', 403);
    env.AUTH_GOOGLE_REGISTRATION_MODE = 'PUBLIC_LAUNDRY_ONBOARDING';

    currentClaims = claims('new');
    trackedEmails.push(currentClaims.verifiedEmail);
    const session = await authService.googleRegister({ idToken: 'opaque', rememberDevice: false });
    assert.equal(session.actor.onboardingStatus, 'PENDING');
    assert.equal(session.actor.hasBusinessContext, false);
    assert.equal(session.user.passwordHash, undefined);
    assert.equal(session.user.role, null);
    assert.equal(session.user.workspaceType, null);
    assert.equal(session.user.resortId, null);
    assert.equal(session.user.active, true);
    assert.equal(session.credential, undefined);
    const created = await prisma.user.findUnique({ where: { email: currentClaims.verifiedEmail }, include: { identities: true, deviceSessions: true } });
    assert.equal(created.passwordHash, null);
    assert.equal(created.onboardingStatus, 'PENDING');
    assert.equal(created.identities.length, 1);
    assert.equal(created.deviceSessions.length, 0);
    await expectCode(authService.googleRegister({ idToken: 'opaque' }), 'GOOGLE_ACCOUNT_ALREADY_REGISTERED', 409);

    currentClaims = claims('email-conflict', { verifiedEmail: created.email });
    await expectCode(authService.googleRegister({ idToken: 'opaque' }), 'GOOGLE_REGISTRATION_EMAIL_CONFLICT', 409);

    currentClaims = claims('unverified', { emailVerified: false });
    await expectCode(authService.googleRegister({ idToken: 'opaque' }), 'GOOGLE_REGISTRATION_EMAIL_REQUIRED', 400);

    const unlinkedUser = await prisma.user.create({ data: { email: `unlinked-${marker}@example.test`, passwordHash: null, role: null, workspaceType: null, onboardingStatus: 'PENDING', active: true } });
    trackedEmails.push(unlinkedUser.email);
    currentClaims = claims('unlinked', { verifiedEmail: unlinkedUser.email });
    await prisma.userIdentity.create({ data: { userId: unlinkedUser.id, provider: 'GOOGLE', providerSubject: currentClaims.providerSubject, providerEmail: currentClaims.verifiedEmail, emailVerified: true, unlinkedAt: new Date() } });
    await expectCode(authService.googleRegister({ idToken: 'opaque' }), 'GOOGLE_IDENTITY_RELINK_REQUIRED', 409);

    const inactiveUser = await prisma.user.create({ data: { email: `inactive-${marker}@example.test`, passwordHash: null, role: null, workspaceType: null, onboardingStatus: 'PENDING', active: false } });
    trackedEmails.push(inactiveUser.email);
    currentClaims = claims('inactive', { verifiedEmail: inactiveUser.email });
    await prisma.userIdentity.create({ data: { userId: inactiveUser.id, provider: 'GOOGLE', providerSubject: currentClaims.providerSubject, providerEmail: currentClaims.verifiedEmail, emailVerified: true } });
    await expectCode(authService.googleRegister({ idToken: 'opaque' }), 'GOOGLE_REGISTRATION_UNAVAILABLE', 409);

    currentClaims = claims('concurrent');
    trackedEmails.push(currentClaims.verifiedEmail);
    const concurrent = await Promise.allSettled([
      authService.googleRegister({ idToken: 'opaque' }),
      authService.googleRegister({ idToken: 'opaque' }),
    ]);
    assert.equal(concurrent.filter((item) => item.status === 'fulfilled').length, 1);
    const loser = concurrent.find((item) => item.status === 'rejected');
    assert.equal(loser.reason.code, 'GOOGLE_ACCOUNT_ALREADY_REGISTERED');
    assert.equal(await prisma.user.count({ where: { email: currentClaims.verifiedEmail } }), 1);
    assert.equal(await prisma.userIdentity.count({ where: { providerSubject: currentClaims.providerSubject } }), 1);

    currentClaims = claims('remembered');
    trackedEmails.push(currentClaims.verifiedEmail);
    const remembered = await authService.googleRegister({ idToken: 'opaque', rememberDevice: true, deviceLabel: 'Verify Device' }, { userAgent: 'Verifier' });
    assert.ok(remembered.credential && remembered.sessionId);
    assert.equal(await prisma.deviceSession.count({ where: { userId: remembered.user.id } }), 1);

    const orphanEmail = `orphan-${marker}@example.test`;
    await assert.rejects(() => authRepository.createPasswordlessOnboardingUserWithIdentity({
      user: { email: orphanEmail },
      identity: { provider: 'NOT_A_PROVIDER', providerSubject: `orphan-${marker}` },
    }));
    assert.equal(await prisma.user.count({ where: { email: orphanEmail } }), 0);

    const after = await Promise.all([
      prisma.tenant.count(), prisma.laundryWorkspace.count(), prisma.branch.count(), prisma.tenantMembership.count(),
    ]);
    assert.deepEqual(after, baseline);

    currentClaims = claims('http');
    trackedEmails.push(currentClaims.verifiedEmail);
    const { createApp } = require('../src/app');
    server = createApp().listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/google/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: 'opaque-http', rememberDevice: true, deviceLabel: 'HTTP Verify' }),
    });
    const body = await response.json();
    assert.equal(response.status, 201);
    assert.match(response.headers.get('set-cookie') || '', new RegExp(`^${env.AUTH_COOKIE_NAME}=`));
    assert.equal(body.data.actor.onboardingStatus, 'PENDING');
    assert.equal(body.data.actor.hasBusinessContext, false);
    assert.equal(body.data.credential, undefined);
    assert.equal(body.data.sessionId, undefined);
    assert.equal(JSON.stringify(body).includes(currentClaims.providerSubject), false);
    assert.equal(JSON.stringify(body).includes('opaque-http'), false);

    const googleLogin = await authService.googleLogin({ idToken: 'opaque-http', rememberDevice: false });
    assert.equal(googleLogin.user.id, body.data.user.id);
    assert.equal(googleLogin.actor.onboardingStatus, 'PENDING');

    const passwordEmail = `password-regression-${marker}@example.test`;
    trackedEmails.push(passwordEmail);
    const passwordRegistration = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: passwordEmail, password: 'verification-password', role: 'LAUNDRY_MANAGER', workspaceType: 'LAUNDRY' }),
    });
    assert.equal(passwordRegistration.status, 201);
    const passwordLogin = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: passwordEmail, password: 'verification-password' }),
    });
    assert.equal(passwordLogin.status, 200);

    console.log('AUTH_GOOGLE_REGISTRATION_VERIFY=PASS');
  } finally {
    env.AUTH_GOOGLE_REGISTRATION_MODE = originalMode;
    if (server) await new Promise((resolve) => server.close(resolve));
    await prisma.user.deleteMany({ where: { email: { in: trackedEmails } } });
    await prisma.$disconnect();
  }
}

run().catch((error) => { console.error(error); process.exitCode = 1; });
