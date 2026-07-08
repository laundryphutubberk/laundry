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
  const resolvedMocks = new Map(Object.entries(mocks));

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
      './laundry-work.repository': repository,
    },
    async () => {
      clearModule('../src/modules/laundry-work/laundry-work.service');
      const { listLaundryWorks } = require('../src/modules/laundry-work/laundry-work.service');

      const result = await listLaundryWorks(
        { skip: '0', take: '10', resortId: '999', workspaceType: WORKSPACE_TYPES.LAUNDRY },
        { actor: resortStaffActor },
      );

      assert.equal(result.items.length, 1);
      assert.deepEqual(calls[0].where, { resortId: 10 });
      assert.equal(calls[0].skip, 0);
      assert.equal(calls[0].take, 10);
    },
  );
};

const runOperationalWriteDenyTest = async () => {
  const repository = {
    transaction: async (callback) => callback({}),
  };

  await withMockedModules(
    {
      './laundry-bag.repository': repository,
    },
    async () => {
      clearModule('../src/modules/laundry-bag/laundry-bag.service');
      const { createLaundryBag } = require('../src/modules/laundry-bag/laundry-bag.service');

      await assertThrowsWithCode(
        () => createLaundryBag(1, { bagNo: 'BAG-001' }, { actor: resortStaffActor }),
        'AUTHORIZATION_POLICY_VIOLATION',
      );
    },
  );
};

const runOperationalWriteAllowTest = async () => {
  const calls = [];
  const repository = {
    transaction: async (callback) => callback({ testClient: true }),
    findAccessibleWork: async ({ workId, where, client }) => {
      calls.push({ fn: 'findAccessibleWork', workId, where, client });
      return {
        id: Number(workId),
        resortId: 22,
        currentStatus: 'DRAFT',
      };
    },
    findLaundryBagByBagNo: async ({ workId, bagNo, client }) => {
      calls.push({ fn: 'findLaundryBagByBagNo', workId, bagNo, client });
      return null;
    },
    createLaundryBag: async ({ data, client }) => {
      calls.push({ fn: 'createLaundryBag', data, client });
      return { id: 101, ...data };
    },
    incrementLaundryWorkBagCount: async ({ workId, nextStatus, client }) => {
      calls.push({ fn: 'incrementLaundryWorkBagCount', workId, nextStatus, client });
      return { id: workId, currentStatus: nextStatus };
    },
    createWorkStatusLog: async ({ data, client }) => {
      calls.push({ fn: 'createWorkStatusLog', data, client });
      return { id: 1, ...data };
    },
  };

  await withMockedModules(
    {
      './laundry-bag.repository': repository,
    },
    async () => {
      clearModule('../src/modules/laundry-bag/laundry-bag.service');
      const { createLaundryBag } = require('../src/modules/laundry-bag/laundry-bag.service');

      const created = await createLaundryBag(
        7,
        {
          bagNo: 'BAG-001',
          resortId: 999,
          note: 'First bag',
        },
        { actor: laundryStaffActor },
      );

      assert.equal(created.id, 101);
      assert.equal(created.workId, 7);
      assert.equal(created.resortId, 22);
      assert.equal(created.bagNo, 'BAG-001');

      const workCall = calls.find((call) => call.fn === 'findAccessibleWork');
      assert.deepEqual(workCall.where, {});
      assert.deepEqual(workCall.client, { testClient: true });

      const createCall = calls.find((call) => call.fn === 'createLaundryBag');
      assert.equal(createCall.data.resortId, 22);
      assert.equal(createCall.data.resortId === 999, false);
    },
  );
};

const runMasterDataManagementTest = async () => {
  const createdRecords = [];
  const repository = {
    transaction: async (callback) => callback({ testClient: true }),
    createResort: async ({ data, client }) => {
      createdRecords.push({ data, client });
      return { id: 1, ...data };
    },
  };

  await withMockedModules(
    {
      './resort.repository': repository,
    },
    async () => {
      clearModule('../src/modules/resort/resort.service');
      const { createResort } = require('../src/modules/resort/resort.service');

      await assertThrowsWithCode(
        () => createResort({ name: 'Resort A' }, { actor: laundryStaffActor }),
        'AUTHORIZATION_POLICY_VIOLATION',
      );

      const created = await createResort({ name: ' Resort A ' }, { actor: laundryManagerActor });

      assert.equal(created.id, 1);
      assert.equal(created.name, 'Resort A');
      assert.equal(created.active, true);
      assert.deepEqual(createdRecords[0].client, { testClient: true });
    },
  );
};

const run = async () => {
  await runActorScopedReadServiceTest();
  await runOperationalWriteDenyTest();
  await runOperationalWriteAllowTest();
  await runMasterDataManagementTest();

  console.log('BE-07 feature-first service policy tests passed.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
