const assert = require('assert/strict');
const http = require('http');
const Module = require('module');
const path = require('path');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://verify:verify@localhost:5432/laundry_verify';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'verify-laundry-image-http-secret-at-least-32-chars';
process.env.ENABLE_DEV_ACTOR_HEADER = 'false';

const { USER_ROLES, WORKSPACE_TYPES } = require('../src/core/actor');
const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' });
const srcRoot = `${path.resolve(__dirname, '../src')}${path.sep}`;

const clearRuntimeModules = () => {
  Object.keys(require.cache).forEach((resolvedPath) => {
    if (resolvedPath.startsWith(srcRoot)) delete require.cache[resolvedPath];
  });
};

const withMockedModules = async (mocks, callback) => {
  const originalLoad = Module._load;
  const resolvedMocks = new Map(Object.entries(mocks));
  Module._load = function patchedLoad(request, parent, isMain) {
    if (resolvedMocks.has(request)) return resolvedMocks.get(request);
    return originalLoad.call(this, request, parent, isMain);
  };
  try {
    clearRuntimeModules();
    return await callback();
  } finally {
    Module._load = originalLoad;
    clearRuntimeModules();
  }
};

const requestJson = (server, { method = 'GET', path: requestPath, token, body } = {}) => {
  const payload = body === undefined ? null : JSON.stringify(body);
  const address = server.address();
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: address.port,
      path: requestPath,
      method,
      headers: {
        Accept: 'application/json',
        ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try { resolve({ statusCode: res.statusCode, body: raw ? JSON.parse(raw) : null }); }
        catch (error) { reject(error); }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const listen = (app) => new Promise((resolve) => {
  const server = app.listen(0, '127.0.0.1', () => resolve(server));
});
const close = (server) => new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));

const createImageRepository = () => ({
  transaction: async (callback) => callback({ testClient: true }),
  listLaundryWorkImages: async () => [{ id: 300, workId: 20, resortId: 10, url: 'https://example.com/a.jpg', isCover: false, deletedAt: null }],
  findLaundryWorkImageById: async ({ imageId }) => ({ id: Number(imageId), workId: 20, resortId: 10, url: 'https://example.com/a.jpg', isCover: false, deletedAt: null }),
  createLaundryWorkImage: async ({ data }) => ({ id: 301, ...data, deletedAt: null }),
  updateLaundryWorkImage: async ({ imageId, data }) => ({ id: Number(imageId), workId: 20, resortId: 10, url: 'https://example.com/a.jpg', isCover: false, deletedAt: null, ...data }),
  clearLaundryWorkCover: async () => ({ count: 1 }),
  softDeleteLaundryWorkImage: async ({ imageId }) => ({ id: Number(imageId), workId: 20, resortId: 10, url: 'https://example.com/a.jpg', isCover: false, deletedAt: new Date() }),
});

const createWorkRepository = (currentStatus = 'ITEM_COUNTED') => ({
  findLaundryWorkById: async ({ workId, where }) => {
    if (where.resortId && Number(where.resortId) !== 10) return null;
    return { id: Number(workId), resortId: where.resortId || 10, currentStatus };
  },
});

const laundryToken = jwt.sign({ userId: 1, role: USER_ROLES.LAUNDRY_STAFF, workspaceType: WORKSPACE_TYPES.LAUNDRY, active: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
const resortToken = jwt.sign({ userId: 2, role: USER_ROLES.RESORT_STAFF, workspaceType: WORKSPACE_TYPES.RESORT, resortId: 10, active: true }, process.env.JWT_SECRET, { expiresIn: '5m' });
const otherResortToken = jwt.sign({ userId: 3, role: USER_ROLES.RESORT_STAFF, workspaceType: WORKSPACE_TYPES.RESORT, resortId: 11, active: true }, process.env.JWT_SECRET, { expiresIn: '5m' });

const withServer = async ({ workStatus = 'ITEM_COUNTED' } = {}, callback) => withMockedModules({
  '../repositories/laundryWorkImages.repository': createImageRepository(),
  '../repositories/laundryWorks.repository': createWorkRepository(workStatus),
}, async () => {
  const { createApp } = require('../src/app');
  const server = await listen(createApp());
  try { await callback(server); } finally { await close(server); }
});

const runRouteContractTest = async () => withServer({}, async (server) => {
  const list = await requestJson(server, { path: '/api/laundry/works/20/images', token: resortToken });
  assert.equal(list.statusCode, 200);
  assert.equal(list.body.success, true);
  assert.equal(list.body.data.length, 1);

  const create = await requestJson(server, { method: 'POST', path: '/api/laundry/works/20/images', token: laundryToken, body: { url: 'https://example.com/new.jpg', caption: 'New' } });
  assert.equal(create.statusCode, 201);
  assert.equal(create.body.success, true);

  const update = await requestJson(server, { method: 'PATCH', path: '/api/laundry/images/300', token: laundryToken, body: { caption: 'Updated' } });
  assert.equal(update.statusCode, 200);
  assert.equal(update.body.data.caption, 'Updated');

  const cover = await requestJson(server, { method: 'PATCH', path: '/api/laundry/images/300/cover', token: laundryToken });
  assert.equal(cover.statusCode, 200);
  assert.equal(cover.body.data.isCover, true);

  const remove = await requestJson(server, { method: 'DELETE', path: '/api/laundry/images/300', token: laundryToken });
  assert.equal(remove.statusCode, 200);
  assert.ok(remove.body.data.deletedAt);
});

const runPolicyAndValidationTest = async () => {
  await withServer({}, async (server) => {
    const crossResortRead = await requestJson(server, { path: '/api/laundry/works/20/images', token: otherResortToken });
    assert.equal(crossResortRead.statusCode, 404);
    assert.equal(crossResortRead.body.success, false);

    const resortMutation = await requestJson(server, { method: 'POST', path: '/api/laundry/works/20/images', token: resortToken, body: { url: 'https://example.com/new.jpg' } });
    assert.equal(resortMutation.statusCode, 403);
    assert.equal(resortMutation.body.meta.code, 'AUTHORIZATION_POLICY_VIOLATION');

    const invalid = await requestJson(server, { method: 'POST', path: '/api/laundry/works/20/images', token: laundryToken, body: { url: 'not-a-url' } });
    assert.equal(invalid.statusCode, 400);
    assert.equal(invalid.body.success, false);
  });

  await withServer({ workStatus: 'CLOSED' }, async (server) => {
    const terminal = await requestJson(server, { method: 'PATCH', path: '/api/laundry/images/300/cover', token: laundryToken });
    assert.equal(terminal.statusCode, 409);
    assert.equal(terminal.body.success, false);
  });
};

const run = async () => {
  await runRouteContractTest();
  await runPolicyAndValidationTest();
  console.log('Laundry Image HTTP contract verification passed.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
