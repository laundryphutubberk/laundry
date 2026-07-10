const assert = require('assert/strict');
const Module = require('module');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://verify:verify@localhost:5432/laundry_verify';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'verify-laundry-issue-secret-at-least-32-chars';

const { USER_ROLES, WORKSPACE_TYPES } = require('../src/core/actor');

const laundryStaffActor = Object.freeze({
  id: 1,
  userId: 1,
  role: USER_ROLES.LAUNDRY_STAFF,
  workspaceType: WORKSPACE_TYPES.LAUNDRY,
  resortId: null,
  active: true,
});

const resortStaffActor = Object.freeze({
  id: 2,
  userId: 2,
  role: USER_ROLES.RESORT_STAFF,
  workspaceType: WORKSPACE_TYPES.RESORT,
  resortId: 10,
  active: true,
});

const clearModule = (relativePath) => {
  const resolved = require.resolve(relativePath);
  delete require.cache[resolved];
};

const withMockedModules = async (mocks, callback) => {
  const originalLoad = Module._load;
  const resolvedMocks = new Map(Object.entries(mocks));

  Module._load = function patchedLoad(request, parent, isMain) {
    if (resolvedMocks.has(request)) return resolvedMocks.get(request);
    return originalLoad.call(this, request, parent, isMain);
  };

  try {
    clearModule('../src/services/laundryIssues.service');
    return await callback();
  } finally {
    Module._load = originalLoad;
    clearModule('../src/services/laundryIssues.service');
  }
};

const expectError = async (fn, { statusCode, message }) => {
  await assert.rejects(fn, (error) => {
    assert.equal(error.statusCode, statusCode);
    assert.match(error.message, message);
    return true;
  });
};

const createRepository = (overrides = {}) => {
  const calls = [];
  const issue = {
    id: 300,
    workId: 20,
    resortId: 5,
    bagId: 100,
    countLineId: 200,
    issueType: 'DAMAGED',
    quantity: 1,
    description: 'Damaged item',
    status: 'OPEN',
  };

  const repository = {
    transaction: async (callback) => callback({ testClient: true }),
    findScopedBag: async ({ bagId, workId, resortId, client }) => {
      calls.push({ fn: 'findScopedBag', bagId, workId, resortId, client });
      return { id: Number(bagId), workId, resortId };
    },
    findScopedCountLine: async ({ countLineId, workId, resortId, client }) => {
      calls.push({ fn: 'findScopedCountLine', countLineId, workId, resortId, client });
      return {
        id: Number(countLineId),
        workId,
        resortId,
        bagId: 100,
        itemTypeId: 7,
        colorGroup: 'WHITE',
      };
    },
    createLaundryIssue: async ({ data, client }) => {
      calls.push({ fn: 'createLaundryIssue', data, client });
      return { id: issue.id, ...data };
    },
    updateLaundryIssueLinks: async ({ issueId, bagId, countLineId, client }) => {
      calls.push({ fn: 'updateLaundryIssueLinks', issueId, bagId, countLineId, client });
      return { issueId, bagId, countLineId };
    },
    updateWorkIssueCount: async ({ workId, resortId, client }) => {
      calls.push({ fn: 'updateWorkIssueCount', workId, resortId, client });
      return { workId, resortId, issueCount: 1 };
    },
    findLaundryIssueById: async ({ issueId, where, client }) => {
      calls.push({ fn: 'findLaundryIssueById', issueId, where, client });
      return { ...issue, id: Number(issueId) };
    },
    updateLaundryIssue: async ({ issueId, where, data, client }) => {
      calls.push({ fn: 'updateLaundryIssue', issueId, where, data, client });
      return { ...issue, id: Number(issueId), ...data };
    },
    listLaundryIssues: async ({ where }) => {
      calls.push({ fn: 'listLaundryIssues', where });
      return { items: [issue], total: 1 };
    },
    ...overrides,
  };

  return { repository, calls, issue };
};

const createWorkRepository = (workStatus = 'ITEM_COUNTED') => ({
  findLaundryWorkById: async ({ workId, where, client }) => ({
    id: Number(workId),
    resortId: where.resortId || 5,
    currentStatus: workStatus,
    client,
  }),
});

const runResortMutationDeniedTest = async () => {
  const { repository } = createRepository();

  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': repository,
      '../repositories/laundryWorks.repository': createWorkRepository(),
    },
    async () => {
      const { createLaundryIssue } = require('../src/services/laundryIssues.service');
      await assert.rejects(
        () => createLaundryIssue(20, { issueType: 'DAMAGED' }, { actor: resortStaffActor }),
        (error) => {
          assert.equal(error.code, 'AUTHORIZATION_POLICY_VIOLATION');
          return true;
        },
      );
    },
  );
};

const runTerminalWorkBlockedTest = async () => {
  const { repository } = createRepository();

  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': repository,
      '../repositories/laundryWorks.repository': createWorkRepository('CLOSED'),
    },
    async () => {
      const { createLaundryIssue } = require('../src/services/laundryIssues.service');
      await expectError(
        () => createLaundryIssue(20, { issueType: 'DAMAGED' }, { actor: laundryStaffActor }),
        { statusCode: 409, message: /closed or cancelled Laundry Work/ },
      );
    },
  );
};

const runInvalidBagCountLinePairBlockedTest = async () => {
  const { repository } = createRepository({
    findScopedCountLine: async ({ countLineId, workId, resortId }) => ({
      id: Number(countLineId),
      workId,
      resortId,
      bagId: 999,
      itemTypeId: 7,
      colorGroup: 'WHITE',
    }),
  });

  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': repository,
      '../repositories/laundryWorks.repository': createWorkRepository(),
    },
    async () => {
      const { createLaundryIssue } = require('../src/services/laundryIssues.service');
      await expectError(
        () => createLaundryIssue(
          20,
          { issueType: 'DAMAGED', bagId: 100, countLineId: 200 },
          { actor: laundryStaffActor },
        ),
        { statusCode: 409, message: /does not belong to the selected Laundry Bag/ },
      );
    },
  );
};

const runCountLineDerivationAndSummarySyncTest = async () => {
  const { repository, calls } = createRepository();

  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': repository,
      '../repositories/laundryWorks.repository': createWorkRepository(),
    },
    async () => {
      const { createLaundryIssue } = require('../src/services/laundryIssues.service');
      await createLaundryIssue(
        20,
        { issueType: 'DAMAGED', bagId: 100, countLineId: 200, quantity: 1 },
        { actor: laundryStaffActor },
      );

      const createCall = calls.find((call) => call.fn === 'createLaundryIssue');
      assert.equal(createCall.data.itemTypeId, 7);
      assert.equal(createCall.data.colorGroup, 'WHITE');

      const linkCall = calls.find((call) => call.fn === 'updateLaundryIssueLinks');
      assert.equal(linkCall.bagId, 100);
      assert.equal(linkCall.countLineId, 200);

      assert.equal(calls.some((call) => call.fn === 'updateWorkIssueCount'), true);
    },
  );
};

const runUnlinkIssueToWorkLevelTest = async () => {
  const { repository, calls } = createRepository();

  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': repository,
      '../repositories/laundryWorks.repository': createWorkRepository(),
    },
    async () => {
      const { updateLaundryIssue } = require('../src/services/laundryIssues.service');
      await updateLaundryIssue(
        300,
        { bagId: null, countLineId: null, description: 'Work-level issue' },
        { actor: laundryStaffActor },
      );

      const linkCall = calls.find((call) => call.fn === 'updateLaundryIssueLinks');
      assert.equal(linkCall.bagId, null);
      assert.equal(linkCall.countLineId, null);
      assert.equal(calls.some((call) => call.fn === 'updateWorkIssueCount'), true);
    },
  );
};

const runCancelIssueSummarySyncTest = async () => {
  const { repository, calls } = createRepository();

  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': repository,
      '../repositories/laundryWorks.repository': createWorkRepository(),
    },
    async () => {
      const { updateLaundryIssue } = require('../src/services/laundryIssues.service');
      await updateLaundryIssue(
        300,
        { status: 'CANCELLED' },
        { actor: laundryStaffActor },
      );

      const updateCall = calls.find((call) => call.fn === 'updateLaundryIssue');
      assert.equal(updateCall.data.status, 'CANCELLED');
      assert.equal(calls.some((call) => call.fn === 'updateWorkIssueCount'), true);
    },
  );
};

const runCancelledIssueEditBlockedTest = async () => {
  const { repository } = createRepository({
    findLaundryIssueById: async () => ({
      id: 300,
      workId: 20,
      resortId: 5,
      status: 'CANCELLED',
    }),
  });

  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': repository,
      '../repositories/laundryWorks.repository': createWorkRepository(),
    },
    async () => {
      const { updateLaundryIssue } = require('../src/services/laundryIssues.service');
      await expectError(
        () => updateLaundryIssue(300, { description: 'should not update' }, { actor: laundryStaffActor }),
        { statusCode: 409, message: /Resolved or cancelled Laundry Issue cannot be edited/ },
      );
    },
  );
};

const runCancelledIssueResolveBlockedTest = async () => {
  const { repository } = createRepository({
    findLaundryIssueById: async () => ({
      id: 300,
      workId: 20,
      resortId: 5,
      status: 'CANCELLED',
      description: 'Cancelled issue',
    }),
  });

  await withMockedModules(
    {
      '../repositories/laundryIssues.repository': repository,
      '../repositories/laundryWorks.repository': createWorkRepository(),
    },
    async () => {
      const { resolveLaundryIssue } = require('../src/services/laundryIssues.service');
      await expectError(
        () => resolveLaundryIssue(300, { resolutionNote: 'should not resolve' }, { actor: laundryStaffActor }),
        { statusCode: 409, message: /Cancelled Laundry Issue cannot be resolved/ },
      );
    },
  );
};

const run = async () => {
  await runResortMutationDeniedTest();
  await runTerminalWorkBlockedTest();
  await runInvalidBagCountLinePairBlockedTest();
  await runCountLineDerivationAndSummarySyncTest();
  await runUnlinkIssueToWorkLevelTest();
  await runCancelIssueSummarySyncTest();
  await runCancelledIssueEditBlockedTest();
  await runCancelledIssueResolveBlockedTest();

  console.log('Laundry Issue service contract verification passed.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
