const assert = require('assert/strict');
const Module = require('module');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://verify:verify@localhost:5432/laundry_verify';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'verify-service-jwt-secret-at-least-32-chars';
process.env.ENABLE_DEV_ACTOR_HEADER = process.env.ENABLE_DEV_ACTOR_HEADER || 'false';

const { USER_ROLES, WORKSPACE_TYPES } = require('../src/core/actor');

const laundryStaffActor = Object.freeze({
  userId: 1,
  role: USER_ROLES.LAUNDRY_STAFF,
  workspaceType: WORKSPACE_TYPES.LAUNDRY,
  resortId: null,
  active: true,
});

const laundryManagerActor = Object.freeze({
  userId: 2,
  role: USER_ROLES.LAUNDRY_MANAGER,
  workspaceType: WORKSPACE_TYPES.LAUNDRY,
  resortId: null,
  active: true,
});

const resortStaffActor = Object.freeze({
  userId: 3,
  role: USER_ROLES.RESORT_STAFF,
  workspaceType: WORKSPACE_TYPES.RESORT,
  resortId: 10,
  active: true,
});

const assertThrowsWithCode = async (fn, code) => {
  await assert.rejects(fn, (error) => {
    assert.equal(error.code, code);
    assert.equal(typeof error.statusCode, 'number');
    return true;
  });
};

const withMockedModules = async (mocks, callback) => {
  const originalLoad = Module._load;
  const resolvedMocks = new Map();

  for (const [request, mock] of Object.entries(mocks)) {
    resolvedMocks.set(request, mock);
  }

  Module._load = function patchedLoad(request, parent, isMain) {
    if (resolvedMocks.has(request)) {
      return resolvedMocks.get(request);
    }

    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    return await callback();
  } finally {
    Module._load = originalLoad;
  }
};

const clearModule = (relativePath) => {
  const resolved = require.resolve(relativePath);
  delete require.cache[resolved];
};

const runActorScopedReadServiceTest = async () => {
  const calls = [];

  const repository = {
    listLaundryWorks: async ({ where, skip, take }) => {
      calls.push({ where, skip, take });
      return {
        items: [{ id: 1, resortId: 10 }],
        total: 1,
      };
    },
  };

  await withMockedModules(
    {
      '../repositories/laundryWorks.repository': repository,
      '../repositories/laundryWorksBusiness.repository': {},
    },
    async () => {
      clearModule('../src/services/laundryWorks.service');
      const { listLaundryWorks } = require('../src/services/laundryWorks.service');

      const result = await listLaundryWorks({ skip: '0', take: '10' }, { actor: resortStaffActor });

      assert.equal(result.items.length, 1);
      assert.deepEqual(calls[0].where, { resortId: 10 });
      assert.equal(calls[0].skip, 0);
      assert.equal(calls[0].take, 10);
    },
  );
};

const runOperationalWritePermissionTest = async () => {
  const repository = {
    transaction: async (callback) => callback({}),
  };

  await withMockedModules(
    {
      '../repositories/laundryBags.repository': repository,
    },
    async () => {
      clearModule('../src/services/laundryBags.service');
      const { createLaundryBag } = require('../src/services/laundryBags.service');

      await assertThrowsWithCode(
        () => createLaundryBag(1, { bagNo: 'BAG-001' }, { actor: resortStaffActor }),
        'AUTHORIZATION_POLICY_VIOLATION',
      );
    },
  );
};

const runMasterDataManagementPermissionTest = async () => {
  const repository = {
    transaction: async (callback) => callback({}),
  };

  await withMockedModules(
    {
      '../repositories/resorts.repository': repository,
    },
    async () => {
      clearModule('../src/services/resorts.service');
      const { createResort } = require('../src/services/resorts.service');

      await assertThrowsWithCode(
        () => createResort({ name: 'Resort A' }, { actor: laundryStaffActor }),
        'AUTHORIZATION_POLICY_VIOLATION',
      );

      await assert.rejects(
        () => createResort({ name: 'Resort A' }, { actor: laundryManagerActor }),
        (error) => error.code !== 'AUTHORIZATION_POLICY_VIOLATION',
      );
    },
  );
};

const run = async () => {
  await runActorScopedReadServiceTest();
  await runOperationalWritePermissionTest();
  await runMasterDataManagementPermissionTest();

  console.log('BE-07 representative service policy tests passed.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
