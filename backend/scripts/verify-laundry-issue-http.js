const assert = require('assert/strict');
const http = require('http');
const Module = require('module');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://verify:verify@localhost:5432/laundry_verify';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'verify-laundry-issue-http-secret-at-least-32-chars';
process.env.ENABLE_DEV_ACTOR_HEADER = 'false';

const { USER_ROLES, WORKSPACE_TYPES } = require('../src/core/actor');

const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' });

const clearModule = (relativePath) => {
  const resolved = require.resolve(relativePath);
  delete require.cache[resolved];
};

const clearRuntimeModules = () => {
  [
    '../src/app',
    '../src/routes',
    '../src/routes/laundryWorks.routes',
    '../src/controllers/laundryIssues.controller',
    '../src/services/laundryIssues.service',
  ].forEach(clearModule);
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

const requestJson = (server, { method = 'GET', path, token, body } = {}) => {
  const payload = body === undefined ? null : JSON.stringify(body);
  const address = server.address();

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: address.port,
        path,
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

const createIssueRepository = ({ issueStatus = 'OPEN', countLineBagId = 100 } = {}) => ({
  transaction: async (callback) => callback({ testClient: true }),
  findScopedBag: async ({ bagId, workId, resortId }) => ({ id: Number(bagId), workId, resortId }),
  findScopedCountLine: async ({ countLineId, workId, resortId }) => ({
    id: Number(countLineId),
    workId,
    resortId,
    bagId: countLineBagId,
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
    status: issueStatus,
  }),
  updateLaundryIssue: async ({ issueId, data }) => ({
    id: Number(issueId),
    workId: 20,
    resortId: 5,
    status: issueStatus,
    ...data,
  }),
  listLaundryIssues: async () => ({ items: [], total: 0 }),
});

const createWorkRepository = (currentStatus = 'ITEM_COUNTED') => ({
  findLaundryWorkById: async ({ workId, where }) => ({
    id: Number(workId),
    resortId: where.resortId || 5,
    currentStatus,
  }),
});

const laundryToken = createToken({
  userId: 1,
  role: USER_ROLES.LAUNDRY_STAFF,
  workspaceType: WORKSPACE_TYPES.LAUNDRY,
  active: true,
});

const resortToken = createToken({
  userId: 2,
  role: USER_ROLES.RESORT_STAFF,
  workspaceType: WORKSPACE_TYPES.RESORT,
  resortId: 5,
  active: true,
});

const validCreateBody = Object.freeze({
  issueType: 'DAMAGED',
  quantity: 1,
  description: 'HTTP contract verification issue',
});

const runResortMutationDeniedTest = async () => {
  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': createIssueRepository(),
      '../repositories/laundryWorks.repository': createWorkRepository(),
    },
    async () => {
      const { createApp } = require('../src/app');
      const server = await listen(createApp());
      try {
        const response = await requestJson(server, {
          method: 'POST',
          path: '/api/laundry/works/20/issues',
          token: resortToken,
          body: validCreateBody,
        });
        assert.equal(response.statusCode, 403);
        assert.equal(response.body.success, false);
        assert.equal(response.body.meta.code, 'AUTHORIZATION_POLICY_VIOLATION');
      } finally {
        await close(server);
      }
    },
  );
};

const runTerminalWorkBlockedTest = async () => {
  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': createIssueRepository(),
      '../repositories/laundryWorks.repository': createWorkRepository('CLOSED'),
    },
    async () => {
      const { createApp } = require('../src/app');
      const server = await listen(createApp());
      try {
        const response = await requestJson(server, {
          method: 'POST',
          path: '/api/laundry/works/20/issues',
          token: laundryToken,
          body: validCreateBody,
        });
        assert.equal(response.statusCode, 409);
        assert.equal(response.body.success, false);
      } finally {
        await close(server);
      }
    },
  );
};

const runInvalidPairBlockedTest = async () => {
  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': createIssueRepository({ countLineBagId: 999 }),
      '../repositories/laundryWorks.repository': createWorkRepository(),
    },
    async () => {
      const { createApp } = require('../src/app');
      const server = await listen(createApp());
      try {
        const response = await requestJson(server, {
          method: 'POST',
          path: '/api/laundry/works/20/issues',
          token: laundryToken,
          body: { ...validCreateBody, bagId: 100, countLineId: 200 },
        });
        assert.equal(response.statusCode, 409);
        assert.equal(response.body.success, false);
      } finally {
        await close(server);
      }
    },
  );
};

const runCancelledIssueMutationBlockedTest = async () => {
  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': createIssueRepository({ issueStatus: 'CANCELLED' }),
      '../repositories/laundryWorks.repository': createWorkRepository(),
    },
    async () => {
      const { createApp } = require('../src/app');
      const server = await listen(createApp());
      try {
        const updateResponse = await requestJson(server, {
          method: 'PATCH',
          path: '/api/laundry/works/issues/300',
          token: laundryToken,
          body: { description: 'must not update' },
        });
        assert.equal(updateResponse.statusCode, 409);
        assert.equal(updateResponse.body.success, false);

        const resolveResponse = await requestJson(server, {
          method: 'PATCH',
          path: '/api/laundry/works/issues/300/resolve',
          token: laundryToken,
          body: { resolutionNote: 'must not resolve' },
        });
        assert.equal(resolveResponse.statusCode, 409);
        assert.equal(resolveResponse.body.success, false);
      } finally {
        await close(server);
      }
    },
  );
};

const run = async () => {
  await runResortMutationDeniedTest();
  await runTerminalWorkBlockedTest();
  await runInvalidPairBlockedTest();
  await runCancelledIssueMutationBlockedTest();
  console.log('Laundry Issue HTTP contract verification passed.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
