const assert = require('assert/strict');
const http = require('http');
const Module = require('module');
const path = require('path');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://verify:verify@localhost:5432/laundry_verify';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'verify-closed-work-issue-read-secret-32-chars';
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
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: address.port,
        path: requestPath,
        method,
        headers: {
          Accept: 'application/json',
          ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
      (res) => {
        let raw = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { raw += chunk; });
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, body: raw ? JSON.parse(raw) : null });
          } catch (error) {
            reject(error);
          }
        });
      },
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const listen = (app) => new Promise((resolve) => {
  const server = app.listen(0, '127.0.0.1', () => resolve(server));
});

const close = (server) => new Promise((resolve, reject) => {
  server.close((error) => (error ? reject(error) : resolve()));
});

const laundryToken = createToken({
  userId: 1,
  role: USER_ROLES.LAUNDRY_STAFF,
  workspaceType: WORKSPACE_TYPES.LAUNDRY,
  active: true,
});

const validCreateBody = {
  issueType: 'DAMAGED',
  quantity: 1,
  description: 'Terminal work policy verification issue',
};

const createIssueRepository = () => ({
  transaction: async (callback) => callback({ testClient: true }),
  listLaundryIssues: async ({ where }) => ({
    items: [{ id: 300, workId: where.workId, resortId: 5, status: 'OPEN', issueType: 'DAMAGED', quantity: 1 }],
    total: 1,
  }),
  findScopedBag: async ({ bagId, workId, resortId }) => ({ id: Number(bagId), workId, resortId }),
  findScopedCountLine: async ({ countLineId, workId, resortId }) => ({
    id: Number(countLineId),
    workId,
    resortId,
    bagId: 100,
    itemTypeId: 7,
    colorGroup: 'WHITE',
  }),
  createLaundryIssue: async ({ data }) => ({ id: 300, ...data }),
  updateLaundryIssueLinks: async ({ issueId, bagId, countLineId }) => ({ issueId, bagId, countLineId }),
  updateWorkIssueCount: async ({ workId, resortId }) => ({ workId, resortId, issueCount: 1 }),
  findLaundryIssueById: async ({ issueId }) => ({
    id: Number(issueId),
    workId: 20,
    resortId: 5,
    bagId: 100,
    countLineId: 200,
    issueType: 'DAMAGED',
    quantity: 1,
    description: 'Issue',
    status: 'OPEN',
  }),
  updateLaundryIssue: async ({ issueId, data }) => ({
    id: Number(issueId),
    workId: 20,
    resortId: 5,
    status: 'OPEN',
    ...data,
  }),
});

const createWorkRepository = (currentStatus) => ({
  findLaundryWorkById: async ({ workId, where }) => ({
    id: Number(workId),
    resortId: where.resortId || 5,
    currentStatus,
  }),
});

const withServer = async (workStatus, callback) => {
  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': createIssueRepository(),
      '../repositories/laundryWorks.repository': createWorkRepository(workStatus),
    },
    async () => {
      const { createApp } = require('../src/app');
      const server = await listen(createApp());
      try {
        await callback(server);
      } finally {
        await close(server);
      }
    },
  );
};

const assertTerminalReadAllowed = async (workStatus) => {
  await withServer(workStatus, async (server) => {
    const response = await requestJson(server, {
      path: '/api/laundry/works/20/issues',
      token: laundryToken,
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.items.length, 1);
    assert.equal(response.body.data.items[0].workId, 20);
  });
};

const assertTerminalMutationsRejected = async (workStatus) => {
  await withServer(workStatus, async (server) => {
    const createResponse = await requestJson(server, {
      method: 'POST',
      path: '/api/laundry/works/20/issues',
      token: laundryToken,
      body: validCreateBody,
    });
    assert.equal(createResponse.statusCode, 409);
    assert.equal(createResponse.body.success, false);

    const updateResponse = await requestJson(server, {
      method: 'PATCH',
      path: '/api/laundry/issues/300',
      token: laundryToken,
      body: { description: 'must not update' },
    });
    assert.equal(updateResponse.statusCode, 409);
    assert.equal(updateResponse.body.success, false);

    const resolveResponse = await requestJson(server, {
      method: 'PATCH',
      path: '/api/laundry/issues/300/resolve',
      token: laundryToken,
      body: { resolutionNote: 'must not resolve' },
    });
    assert.equal(resolveResponse.statusCode, 409);
    assert.equal(resolveResponse.body.success, false);

    const deleteResponse = await requestJson(server, {
      method: 'DELETE',
      path: '/api/laundry/issues/300',
      token: laundryToken,
    });
    assert.equal(deleteResponse.statusCode, 404);
    assert.equal(deleteResponse.body.success, false);
  });
};

const assertActiveMutationUnchanged = async () => {
  await withServer('ITEM_COUNTED', async (server) => {
    const createResponse = await requestJson(server, {
      method: 'POST',
      path: '/api/laundry/works/20/issues',
      token: laundryToken,
      body: validCreateBody,
    });
    assert.equal(createResponse.statusCode, 201);
    assert.equal(createResponse.body.success, true);

    const updateResponse = await requestJson(server, {
      method: 'PATCH',
      path: '/api/laundry/issues/300',
      token: laundryToken,
      body: { description: 'active work update' },
    });
    assert.equal(updateResponse.statusCode, 200);
    assert.equal(updateResponse.body.success, true);

    const resolveResponse = await requestJson(server, {
      method: 'PATCH',
      path: '/api/laundry/issues/300/resolve',
      token: laundryToken,
      body: { resolutionNote: 'active work resolve' },
    });
    assert.equal(resolveResponse.statusCode, 200);
    assert.equal(resolveResponse.body.success, true);
  });
};

const run = async () => {
  await assertTerminalReadAllowed('CLOSED');
  await assertTerminalReadAllowed('CANCELLED');
  await assertTerminalMutationsRejected('CLOSED');
  await assertTerminalMutationsRejected('CANCELLED');
  await assertActiveMutationUnchanged();

  console.log('Closed-work Issue read completion HTTP verification passed.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
