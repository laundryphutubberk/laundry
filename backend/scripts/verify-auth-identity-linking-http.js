const assert = require('assert/strict');
const bcrypt = require('bcrypt');

process.env.GOOGLE_IDENTITY_ENABLED = 'true';
process.env.GOOGLE_CLIENT_ID = 'linking-verification.apps.googleusercontent.com';
const { OAuth2Client } = require('google-auth-library');
OAuth2Client.prototype.verifyIdToken = async function verifyIdToken({ idToken }) {
  const changed = idToken.includes('changed');
  return { getPayload: () => ({
    sub: idToken.replace(/^token-/, '').replace('-changed', ''), aud: process.env.GOOGLE_CLIENT_ID,
    iss: 'https://accounts.google.com', exp: Math.floor(Date.now() / 1000) + 300,
    email: changed ? 'changed@example.test' : 'provider@example.test', email_verified: true,
    name: changed ? 'Changed Snapshot' : 'Provider Person', picture: 'https://example.test/avatar.png',
  }) };
};

const { createApp } = require('../src/app');
const { prisma } = require('../src/core/prisma');
const { createUserIdentityService } = require('../src/services/userIdentity.service');

async function main() {
  const marker = Date.now();
  const password = 'linking-verification-password';
  const passwordHash = await bcrypt.hash(password, 12);
  const resort = await prisma.resort.create({ data: { name: `Linking Verification ${marker}` } });
  const users = await Promise.all([
    prisma.user.create({ data: { email: `link-a-${marker}@example.test`, passwordHash, role: 'LAUNDRY_MANAGER', workspaceType: 'LAUNDRY', active: true } }),
    prisma.user.create({ data: { email: `link-b-${marker}@example.test`, passwordHash, role: 'RESORT_STAFF', workspaceType: 'RESORT', resortId: resort.id, active: true } }),
  ]);
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/auth`;
  const request = async (path, { token, cookie, body, method = 'POST' } = {}) => {
    const headers = { 'content-type': 'application/json' };
    if (token) headers.authorization = `Bearer ${token}`;
    if (cookie) headers.cookie = cookie;
    const response = await fetch(`${base}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, body: await response.json().catch(() => ({})), cookie: response.headers.get('set-cookie')?.split(';')[0] };
  };
  const login = async (user, rememberDevice = false) => request('/login', { body: { email: user.email, password, rememberDevice } });

  try {
    const authA = await login(users[0]);
    const tokenA = authA.body.data.token;
    const authBefore = await prisma.user.findMany({ where: { id: { in: users.map((user) => user.id) } }, orderBy: { id: 'asc' }, select: { id: true, role: true, workspaceType: true, resortId: true, active: true } });

    const intent = await request('/identities/google/link-intents', { token: tokenA, body: { idToken: `token-subject-${marker}-one` } });
    assert.equal(intent.status, 201);
    assert.equal(await prisma.userIdentity.count({ where: { userId: users[0].id } }), 0);
    assert.equal('providerSubject' in intent.body.data, false);

    assert.equal((await request(`/identities/google/link-intents/${intent.body.data.id}/confirm`, { token: tokenA })).status, 200);
    assert.equal((await request('/step-up/password', { token: tokenA, body: { password: 'wrong-password', purpose: 'LINK_IDENTITY', targetId: intent.body.data.id } })).status, 401);
    const grant = await request('/step-up/password', { token: tokenA, body: { password, purpose: 'LINK_IDENTITY', targetId: intent.body.data.id } });
    assert.equal(grant.status, 201);
    const linked = await request(`/identities/google/link-intents/${intent.body.data.id}/complete`, { token: tokenA, body: { grant: grant.body.data.grant } });
    assert.equal(linked.status, 200);
    assert.equal((await request(`/identities/google/link-intents/${intent.body.data.id}/complete`, { token: tokenA, body: { grant: grant.body.data.grant } })).status, 409);
    const identityId = linked.body.data.id;

    const listed = await request('/identities', { token: tokenA, method: 'GET' });
    assert.equal(listed.status, 200);
    assert.equal('providerSubject' in listed.body.data.items[0], false);
    assert.match(listed.body.data.items[0].email, /\*\*\*/);
    assert.equal(JSON.stringify(listed.body).includes('secretHash'), false);

    assert.equal((await request('/identities/google/link-intents', { token: tokenA, body: { idToken: `token-subject-${marker}-one` } })).status, 409);
    const authB = await login(users[1]);
    assert.equal((await request('/identities/google/link-intents', { token: authB.body.data.token, body: { idToken: `token-subject-${marker}-one` } })).status, 409);

    const cancelled = await request('/identities/google/link-intents', { token: tokenA, body: { idToken: `token-subject-${marker}-cancel` } });
    assert.equal((await request(`/identities/google/link-intents/${cancelled.body.data.id}/cancel`, { token: tokenA })).status, 200);
    assert.equal((await request(`/identities/google/link-intents/${cancelled.body.data.id}/confirm`, { token: tokenA })).status, 409);

    const expired = await request('/identities/google/link-intents', { token: tokenA, body: { idToken: `token-subject-${marker}-expired` } });
    await prisma.identityLinkIntent.update({ where: { id: expired.body.data.id }, data: { expiresAt: new Date(Date.now() - 1000) } });
    assert.equal((await request(`/identities/google/link-intents/${expired.body.data.id}/confirm`, { token: tokenA })).status, 410);

    const grantExpiryIntent = await request('/identities/google/link-intents', { token: tokenA, body: { idToken: `token-subject-${marker}-grant-expiry` } });
    await request(`/identities/google/link-intents/${grantExpiryIntent.body.data.id}/confirm`, { token: tokenA });
    const expiringGrant = await request('/step-up/password', { token: tokenA, body: { password, purpose: 'LINK_IDENTITY', targetId: grantExpiryIntent.body.data.id } });
    const expiringGrantId = expiringGrant.body.data.grant.split('.')[0];
    await prisma.stepUpGrant.update({ where: { id: expiringGrantId }, data: { expiresAt: new Date(Date.now() - 1000) } });
    assert.equal((await request(`/identities/google/link-intents/${grantExpiryIntent.body.data.id}/complete`, { token: tokenA, body: { grant: expiringGrant.body.data.grant } })).status, 410);

    const parallelIntent = await request('/identities/google/link-intents', { token: tokenA, body: { idToken: `token-subject-${marker}-parallel` } });
    await request(`/identities/google/link-intents/${parallelIntent.body.data.id}/confirm`, { token: tokenA });
    const parallelGrant = await request('/step-up/password', { token: tokenA, body: { password, purpose: 'LINK_IDENTITY', targetId: parallelIntent.body.data.id } });
    const parallel = await Promise.all([
      request(`/identities/google/link-intents/${parallelIntent.body.data.id}/complete`, { token: tokenA, body: { grant: parallelGrant.body.data.grant } }),
      request(`/identities/google/link-intents/${parallelIntent.body.data.id}/complete`, { token: tokenA, body: { grant: parallelGrant.body.data.grant } }),
    ]);
    assert.deepEqual(parallel.map((result) => result.status).sort(), [200, 409]);

    const remembered = await login(users[0], true);
    const sessionIntent = await request('/identities/google/link-intents', { token: remembered.body.data.token, cookie: remembered.cookie, body: { idToken: `token-subject-${marker}-session` } });
    await request('/logout', { cookie: remembered.cookie });
    assert.equal((await request(`/identities/google/link-intents/${sessionIntent.body.data.id}/confirm`, { token: remembered.body.data.token, cookie: remembered.cookie })).status, 401);

    const identityService = createUserIdentityService();
    const snapshot = await identityService.updateVerifiedSnapshots({ provider: 'GOOGLE', providerSubject: `subject-${marker}-one`, verifiedEmail: 'changed@example.test', emailVerified: true, displayName: 'Changed Snapshot', avatarUrl: null });
    assert.equal(snapshot.userId, users[0].id);

    const unlinkIntent = await request(`/identities/${identityId}/unlink-intents`, { token: tokenA });
    const unlinkGrant = await request('/step-up/password', { token: tokenA, body: { password, purpose: 'UNLINK_IDENTITY', targetId: unlinkIntent.body.data.id } });
    assert.equal((await request(`/identities/unlink-intents/${unlinkIntent.body.data.id}/complete`, { token: tokenA, body: { grant: unlinkGrant.body.data.grant } })).status, 200);
    await assert.rejects(() => identityService.findActive('GOOGLE', `subject-${marker}-one`), (error) => error.code === 'IDENTITY_REVOKED');
    assert.equal((await request('/identities/google/link-intents', { token: authB.body.data.token, body: { idToken: `token-subject-${marker}-one` } })).status, 409);

    const finalIdentity = await prisma.userIdentity.create({ data: { userId: users[1].id, provider: 'GOOGLE', providerSubject: `subject-${marker}-final`, providerEmail: 'final@example.test', emailVerified: true } });
    const finalIntent = await request(`/identities/${finalIdentity.id}/unlink-intents`, { token: authB.body.data.token });
    const finalGrant = await request('/step-up/password', { token: authB.body.data.token, body: { password, purpose: 'UNLINK_IDENTITY', targetId: finalIntent.body.data.id } });
    await prisma.user.update({ where: { id: users[1].id }, data: { passwordHash: '' } });
    assert.equal((await request(`/identities/unlink-intents/${finalIntent.body.data.id}/complete`, { token: authB.body.data.token, body: { grant: finalGrant.body.data.grant } })).status, 409);

    const authAfter = await prisma.user.findMany({ where: { id: { in: users.map((user) => user.id) } }, orderBy: { id: 'asc' }, select: { id: true, role: true, workspaceType: true, resortId: true, active: true } });
    assert.deepEqual(authAfter, authBefore);
    const stored = await prisma.identityLinkIntent.findMany({ where: { userId: users[0].id } });
    assert.equal(JSON.stringify(stored).includes('token-subject'), false);
    assert.equal(JSON.stringify(await prisma.stepUpGrant.findMany({ where: { userId: users[0].id } })).includes(password), false);
    console.log('AUTH_IDENTITY_LINKING_HTTP_VERIFY=PASS');
  } finally {
    server.close();
    await prisma.user.deleteMany({ where: { id: { in: users.map((user) => user.id) } } }).catch(() => {});
    await prisma.resort.delete({ where: { id: resort.id } }).catch(() => {});
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
