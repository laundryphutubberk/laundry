const assert = require('assert/strict');
const bcrypt = require('bcrypt');
const { createApp } = require('../src/app');
const { prisma } = require('../src/core/prisma');
const { env } = require('../src/config/env');

const cookieValue = (response) => response.headers.get('set-cookie')?.split(';')[0] || '';

async function main() {
  const marker = `auth-device-${Date.now()}@example.test`;
  const resort = await prisma.resort.create({ data: { name: `Auth Device ${Date.now()}` } });
  const user = await prisma.user.create({ data: {
    email: marker,
    passwordHash: await bcrypt.hash('verification-password', 12),
    displayName: 'Auth Device Verification',
    role: 'RESORT_STAFF',
    workspaceType: 'RESORT',
    resortId: resort.id,
    active: true,
  } });
  const server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/auth`;
  const json = async (path, init = {}) => {
    const response = await fetch(`${base}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(init.headers || {}) } });
    return { response, body: await response.json().catch(() => ({})) };
  };

  try {
    const transient = await json('/login', { method: 'POST', body: JSON.stringify({ email: marker, password: 'verification-password', rememberDevice: false }) });
    assert.equal(transient.response.status, 200);
    assert.equal(cookieValue(transient.response), '');
    assert.equal(transient.body.data.actor.role, 'RESORT_STAFF');
    assert.equal(transient.body.data.actor.workspaceType, 'RESORT');

    const remembered = await json('/login', { method: 'POST', body: JSON.stringify({ email: marker, password: 'verification-password', rememberDevice: true, deviceLabel: 'Verification device' }) });
    assert.equal(remembered.response.status, 200);
    const firstCookie = cookieValue(remembered.response);
    assert.match(firstCookie, new RegExp(`^${env.AUTH_COOKIE_NAME}=`));
    const rawFirst = decodeURIComponent(firstCookie.split('=')[1]);
    const sessionId = rawFirst.split('.')[0];
    const stored = await prisma.deviceSession.findUnique({ where: { id: sessionId } });
    assert.ok(stored);
    assert.notEqual(stored.credentialHash, rawFirst);
    assert.equal(JSON.stringify(stored).includes(rawFirst), false);

    const refresh = await json('/session/refresh', { method: 'POST', headers: { cookie: firstCookie } });
    assert.equal(refresh.response.status, 200);
    const rotatedCookie = cookieValue(refresh.response);
    assert.notEqual(rotatedCookie, firstCookie);

    const reused = await json('/session/refresh', { method: 'POST', headers: { cookie: firstCookie } });
    assert.equal(reused.response.status, 401);
    assert.equal(reused.body.meta.code, 'AUTH_SESSION_REUSE_DETECTED');
    assert.ok((await prisma.deviceSession.findUnique({ where: { id: sessionId } })).revokedAt);

    const concurrentLogin = await json('/login', { method: 'POST', body: JSON.stringify({ email: marker, password: 'verification-password', rememberDevice: true }) });
    const concurrentCookie = cookieValue(concurrentLogin.response);
    const concurrentResults = await Promise.all([
      json('/session/refresh', { method: 'POST', headers: { cookie: concurrentCookie } }),
      json('/session/refresh', { method: 'POST', headers: { cookie: concurrentCookie } }),
    ]);
    assert.deepEqual(concurrentResults.map(({ response }) => response.status).sort(), [200, 401]);

    const currentLogoutLogin = await json('/login', { method: 'POST', body: JSON.stringify({ email: marker, password: 'verification-password', rememberDevice: true }) });
    const currentLogoutCookie = cookieValue(currentLogoutLogin.response);
    const currentLogoutId = decodeURIComponent(currentLogoutCookie.split('=')[1]).split('.')[0];
    const currentLogout = await json('/logout', { method: 'POST', headers: { cookie: currentLogoutCookie } });
    assert.equal(currentLogout.response.status, 200);
    assert.ok((await prisma.deviceSession.findUnique({ where: { id: currentLogoutId } })).revokedAt);

    const second = await json('/login', { method: 'POST', body: JSON.stringify({ email: marker, password: 'verification-password', rememberDevice: true }) });
    const secondCookie = cookieValue(second.response);
    const secondToken = second.body.data.token;
    const listed = await json('/sessions', { headers: { authorization: `Bearer ${secondToken}`, cookie: secondCookie } });
    assert.equal(listed.response.status, 200);
    assert.ok(listed.body.data.items.some((item) => item.current));
    assert.equal(JSON.stringify(listed.body).includes('credentialHash'), false);

    const third = await json('/login', { method: 'POST', body: JSON.stringify({ email: marker, password: 'verification-password', rememberDevice: true }) });
    const thirdId = decodeURIComponent(cookieValue(third.response).split('=')[1]).split('.')[0];
    const revoked = await json(`/sessions/${thirdId}/revoke`, { method: 'POST', headers: { authorization: `Bearer ${secondToken}`, cookie: secondCookie } });
    assert.equal(revoked.response.status, 200);
    assert.ok((await prisma.deviceSession.findUnique({ where: { id: thirdId } })).revokedAt);

    const logoutAll = await json('/logout-all', { method: 'POST', headers: { authorization: `Bearer ${secondToken}`, cookie: secondCookie } });
    assert.equal(logoutAll.response.status, 200);
    assert.equal(await prisma.deviceSession.count({ where: { userId: user.id, revokedAt: null } }), 0);

    const idle = await json('/login', { method: 'POST', body: JSON.stringify({ email: marker, password: 'verification-password', rememberDevice: true }) });
    const idleCookie = cookieValue(idle.response);
    const idleId = decodeURIComponent(idleCookie.split('=')[1]).split('.')[0];
    await prisma.deviceSession.update({ where: { id: idleId }, data: { idleExpiresAt: new Date(Date.now() - 1000) } });
    assert.equal((await json('/session/refresh', { method: 'POST', headers: { cookie: idleCookie } })).response.status, 401);

    const absolute = await json('/login', { method: 'POST', body: JSON.stringify({ email: marker, password: 'verification-password', rememberDevice: true }) });
    const absoluteCookie = cookieValue(absolute.response);
    const absoluteId = decodeURIComponent(absoluteCookie.split('=')[1]).split('.')[0];
    await prisma.deviceSession.update({ where: { id: absoluteId }, data: { absoluteExpiresAt: new Date(Date.now() - 1000) } });
    assert.equal((await json('/session/refresh', { method: 'POST', headers: { cookie: absoluteCookie } })).response.status, 401);
    assert.equal((await json('/session/refresh', { method: 'POST' })).response.status, 401);

    console.log('AUTH_DEVICE_SESSION_VERIFY=PASS');
  } finally {
    server.close();
    await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
    await prisma.resort.delete({ where: { id: resort.id } }).catch(() => {});
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
