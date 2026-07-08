const assert = require('assert/strict');
const http = require('http');
const Module = require('module');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://verify:verify@localhost:5432/laundry_verify';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'verify-http-jwt-secret-at-least-32-chars';
process.env.ENABLE_DEV_ACTOR_HEADER = process.env.ENABLE_DEV_ACTOR_HEADER || 'false';

const { USER_ROLES, WORKSPACE_TYPES } = require('../src/core/actor');

const clearModule = (relativePath) => {
  const resolved = require.resolve(relativePath);
  delete require.cache[resolved];
};

const clearRuntimeModules = () => {
  [
    '../src/app',
    '../src/routes',
    '../src/routes/laundryWorks.routes',
    '../src/routes/laundryBags.routes',
    '../src/controllers/laundryWorks.controller',
    '../src/controllers/laundryBags.controller',
    '../src/services/laundryWorks.service',
    '../src/services/laundryBags.service',
  ].forEach(clearModule);
};

const withMockedModules = async (mocks, callback) => {
  const originalLoad = Module._load;
  const resolvedMocks = new Map(Object.entries(mocks));

  Module._load = function patchedLoad(request, parent, isMain) {
    if (resolvedMocks.has(request)) {
      return resolvedMocks.get(request);
    }

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

const createToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' });

const requestJson = (server, { method = 'GET', path, token, body } = {}) => {
  const address = server.address();
  const payload = body === undefined ? null : JSON.stringify(body);

  const options = {
    hostname: '127.0.0.1',
    port: address.port,
    path,
    method,
    headers: {
      Accept: 'application/json',
      ...(payload ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: raw ? JSON.parse(raw) : null,
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
};

const listen = (app) =>
  new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
  });

const close = (server) =>
  new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });

const createLaundryWorkRepositoryMock = (calls) => ({
  listLaundryWorks: async ({ where, skip, take }) => {
    calls.push({ fn: 'listLaundryWorks', where, skip, take });
    return {
      items: [{ id: 1, resortId: where.resortId || null, currentStatus: 'DRAFT' }],
      total: 1,
    };
  },
  transaction: async (callback) => callback({ testClient: true }),
  findLaundryWorkByIdForUpdate: async ({ workId, where, client }) => {
    calls.push({ fn: 'findLaundryWorkByIdForUpdate', workId, where, client });
    return {
      id: Number(workId),
      resortId: where.resortId || 1,
      currentStatus: 'BAG_RECEIVED',
    };
  },
  updateLaundryWorkStatus: async ({ workId, toStatus, client }) => {
    calls.push({ fn: 'updateLaundryWorkStatus', workId, toStatus, client });
    return {
      id: Number(workId),
      currentStatus: toStatus,
    };
  },
  createWorkStatusLog: async ({ data, client }) => {
    calls.push({ fn: 'createWorkStatusLog', data, client });
    return { id: 1, ...data };
  },
});

const createLaundryBagRepositoryMock = (calls) => ({
  transaction: async (callback) => callback({ testClient: true }),
  findAccessibleWork: async ({ workId, where, client }) => {
    calls.push({ fn: 'findAccessibleWork', workId, where, client });
    return {
      id: Number(workId),
      resortId: where.resortId || 22,
      currentStatus: 'DRAFT',
    };
  },
  findLaundryBagByBagNo: async ({ workId, bagNo, client }) => {
    calls.push({ fn: 'findLaundryBagByBagNo', workId, bagNo, client });
    return null;
  },
  createLaundryBag: async ({ data, client }) => {
    calls.push({ fn: 'createLaundryBag', data, client });
    return { id: 1001, ...data };
  },
  incrementLaundryWorkBagCount: async ({ workId, nextStatus, client }) => {
    calls.push({ fn: 'incrementLaundryWorkBagCount', workId, nextStatus, client });
    return { id: Number(workId), currentStatus: nextStatus };
  },
  createWorkStatusLog: async ({ data, client }) => {
    calls.push({ fn: 'createWorkStatusLog', data, client });
    return { id: 2001, ...data };
  },
  listLaundryBags: async ({ where, skip, take }) => {
    calls.push({ fn: 'listLaundryBags', where, skip, take });
    return {
      items: [{ id: 1, workId: where.workId, resortId: where.resortId || null }],
      total: 1,
    };
  },
});

const createAppWithMocks = async (calls) => {
  const mocks = {
    '../repositories/laundryWorks.repository': createLaundryWorkRepositoryMock(calls),
    '../repositories/laundryWorksBusiness.repository': {},
    '../repositories/laundryBags.repository': createLaundryBagRepositoryMock(calls),
  };

  let app;
  await withMockedModules(mocks, async () => {
    const { createApp } = require('../src/app');
    app = createApp();
  });

  return app;
};

const runUnauthenticatedRouteTest = async () => {
  const calls = [];

  await withMockedModules(
    {
      '../repositories/laundryWorks.repository': createLaundryWorkRepositoryMock(calls),
      '../repositories/laundryWorksBusiness.repository': {},
      '../repositories/laundryBags.repository': createLaundryBagRepositoryMock(calls),
    },
    async () => {
      const { createApp } = require('../src/app');
      const server = await listen(createApp());
      try {
        const response = await requestJson(server, { path: '/api/laundry/works' });
        assert.equal(response.statusCode, 401);
        assert.equal(response.body.success, false);
        assert.equal(response.body.meta.code, 'AUTHENTICATION_REQUIRED');
        assert.equal(calls.length, 0);
      } finally {
        await close(server);
      }
    },
  );
};

const runActorScopedListRouteTest = async () => {
  const calls = [];
  const token = createToken({
    userId: 3,
    role: USER_ROLES.RESORT_STAFF,
    workspaceType: WORKSPACE_TYPES.RESORT,
    resortId: 10,
    active: true,
  });

  await withMockedModules(
    {
      '../repositories/laundryWorks.repository': createLaundryWorkRepositoryMock(calls),
      '../repositories/laundryWorksBusiness.repository': {},
      '../repositories/laundryBags.repository': createLaundryBagRepositoryMock(calls),
    },
    async () => {
      const { createApp } = require('../src/app');
      const server = await listen(createApp());
      try {
        const response = await requestJson(server, {
          path: '/api/laundry/works?resortId=999&workspaceType=LAUNDRY',
          token,
        });

        assert.equal(response.statusCode, 200);
        assert.equal(response.body.success, true);
        const listCall = calls.find((call) => call.fn === 'listLaundryWorks');
        assert.deepEqual(listCall.where, { resortId: 10 });
      } finally {
        await close(server);
      }
    },
  );
};

const runOperationalWriteDenyRouteTest = async () => {
  const calls = [];
  const token = createToken({
    userId: 3,
    role: USER_ROLES.RESORT_STAFF,
    workspaceType: WORKSPACE_TYPES.RESORT,
    resortId: 10,
    active: true,
  });

  await withMockedModules(
    {
      '../repositories/laundryWorks.repository': createLaundryWorkRepositoryMock(calls),
      '../repositories/laundryWorksBusiness.repository': {},
      '../repositories/laundryBags.repository': createLaundryBagRepositoryMock(calls),
    },
    async () => {
      const { createApp } = require('../src/app');
      const server = await listen(createApp());
      try {
        const response = await requestJson(server, {
          method: 'POST',
          path: '/api/laundry/works/7/bags',
          token,
          body: { bagNo: 'BAG-001' },
        });

        assert.equal(response.statusCode, 403);
        assert.equal(response.body.success, false);
        assert.equal(response.body.meta.code, 'AUTHORIZATION_POLICY_VIOLATION');
        assert.equal(calls.some((call) => call.fn === 'createLaundryBag'), false);
      } finally {
        await close(server);
      }
    },
  );
};

const runOperationalWriteAllowRouteTest = async () => {
  const calls = [];
  const token = createToken({
    userId: 1,
    role: USER_ROLES.LAUNDRY_STAFF,
    workspaceType: WORKSPACE_TYPES.LAUNDRY,
    active: true,
  });

  await withMockedModules(
    {
      '../repositories/laundryWorks.repository': createLaundryWorkRepositoryMock(calls),
      '../repositories/laundryWorksBusiness.repository': {},
      '../repositories/laundryBags.repository': createLaundryBagRepositoryMock(calls),
    },
    async () => {
      const { createApp } = require('../src/app');
      const server = await listen(createApp());
      try {
        const response = await requestJson(server, {
          method: 'POST',
          path: '/api/laundry/works/7/bags',
          token,
          body: { bagNo: 'BAG-001', resortId: 999 },
        });

        assert.equal(response.statusCode, 201);
        assert.equal(response.body.success, true);
        assert.equal(response.body.data.resortId, 22);
        const createCall = calls.find((call) => call.fn === 'createLaundryBag');
        assert.equal(createCall.data.resortId, 22);
        assert.equal(createCall.data.resortId === 999, false);
      } finally {
        await close(server);
      }
    },
  );
};

const run = async () => {
  await runUnauthenticatedRouteTest();
  await runActorScopedListRouteTest();
  await runOperationalWriteDenyRouteTest();
  await runOperationalWriteAllowRouteTest();

  console.log('BE-07 HTTP policy integration tests passed.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
