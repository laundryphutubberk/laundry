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

const runOperationalWriteSuccessTest = async () => {
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
      '../repositories/laundryBags.repository': repository,
    },
    async () => {
      clearModule('../src/services/laundryBags.service');
      const { createLaundryBag } = require('../src/services/laundryBags.service');

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
      assert.equal(calls[0].fn, 'findAccessibleWork');
      assert.deepEqual(calls[0].where, {});
      assert.deepEqual(calls[0].client, { testClient: true });

      const createCall = calls.find((call) => call.fn === 'createLaundryBag');
      assert.equal(createCall.data.resortId, 22);
      assert.equal(createCall.data.resortId === 999, false);

      const statusCall = calls.find((call) => call.fn === 'incrementLaundryWorkBagCount');
      assert.equal(statusCall.nextStatus, 'BAG_RECEIVED');
    },
  );
};

const runResortStatusUpdateDeniedTest = async () => {
  const calls = [];
  const repository = {
    transaction: async (callback) => callback({ testClient: true }),
    findLaundryWorkByIdForUpdate: async ({ workId, where, client }) => {
      calls.push({ fn: 'findLaundryWorkByIdForUpdate', workId, where, client });
      return {
        id: Number(workId),
        resortId: 10,
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
      return { id: 501, ...data };
    },
  };

  await withMockedModules(
    {
      '../repositories/laundryWorks.repository': repository,
      '../repositories/laundryWorksBusiness.repository': {},
    },
    async () => {
      clearModule('../src/services/laundryWorks.service');
      const { updateLaundryWorkStatus } = require('../src/services/laundryWorks.service');

      await assertThrowsWithCode(
        () => updateLaundryWorkStatus(
          9,
          {
            toStatus: 'FACTORY_RECEIVED',
            note: 'Factory received',
          },
          { actor: resortStaffActor },
        ),
        'AUTHORIZATION_POLICY_VIOLATION',
      );
      assert.equal(calls.length, 0);
    },
  );
};

const runAtomicLaundryIntakeTest = async () => {
  const calls = [];
  const repository = {
    transaction: async (callback) => callback({ testClient: true }),
    createLaundryWork: async ({ data, client }) => {
      calls.push({ fn: 'createLaundryWork', data, client });
      return {
        id: 91,
        ...data,
        bags: undefined,
        _count: { bags: data.bags?.create?.length || 0 },
      };
    },
    createWorkStatusLog: async ({ data, client }) => {
      calls.push({ fn: 'createWorkStatusLog', data, client });
      return { id: 92, ...data };
    },
  };
  const businessRepository = {
    findResortById: async () => ({ id: 10, active: true }),
    findLaundryWorkByWorkNo: async () => null,
  };

  await withMockedModules(
    {
      '../repositories/laundryWorks.repository': repository,
      '../repositories/laundryWorksBusiness.repository': businessRepository,
    },
    async () => {
      clearModule('../src/services/laundryWorks.service');
      const { createLaundryWork } = require('../src/services/laundryWorks.service');

      const created = await createLaundryWork(
        {
          resortId: 10,
          workNo: 'LW-ATOMIC-001',
          bagCount: 2,
          currentStatus: 'DRAFT',
        },
        { actor: laundryStaffActor },
      );

      assert.equal(created.currentStatus, 'BAG_RECEIVED');
      assert.equal(created.bagCount, 2);
      const createCall = calls.find((call) => call.fn === 'createLaundryWork');
      assert.deepEqual(createCall.client, { testClient: true });
      assert.equal(createCall.data.createdById, laundryStaffActor.userId);
      assert.deepEqual(
        createCall.data.bags.create.map((bag) => bag.bagNo),
        ['LW-ATOMIC-001-BAG-001', 'LW-ATOMIC-001-BAG-002'],
      );
      const logCall = calls.find((call) => call.fn === 'createWorkStatusLog');
      assert.equal(logCall.data.changedById, laundryStaffActor.userId);
      assert.equal(logCall.data.toStatus, 'BAG_RECEIVED');
      assert.deepEqual(logCall.client, { testClient: true });
    },
  );
};

const runMasterDataManagementPermissionTest = async () => {
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
      '../repositories/resorts.repository': repository,
    },
    async () => {
      clearModule('../src/services/resorts.service');
      const { createResort } = require('../src/services/resorts.service');

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
  await runOperationalWritePermissionTest();
  await runOperationalWriteSuccessTest();
  await runResortStatusUpdateDeniedTest();
  await runAtomicLaundryIntakeTest();
  await runMasterDataManagementPermissionTest();

  console.log('BE-07 representative service policy tests passed.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
