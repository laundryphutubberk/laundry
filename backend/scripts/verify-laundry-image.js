const assert = require('assert/strict');
const Module = require('module');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://verify:verify@localhost:5432/laundry_verify';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'verify-laundry-image-secret-at-least-32-chars';

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

const clearService = () => {
  const resolved = require.resolve('../src/services/laundryWorkImages.service');
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
    clearService();
    return await callback();
  } finally {
    Module._load = originalLoad;
    clearService();
  }
};

const createImageRepository = (overrides = {}) => {
  const calls = [];
  const image = {
    id: 300,
    workId: 20,
    resortId: 10,
    url: 'https://example.com/evidence.jpg',
    caption: 'Evidence',
    displayOrder: 0,
    isCover: false,
    deletedAt: null,
  };

  const repository = {
    transaction: async (callback) => callback({ testClient: true }),
    listLaundryWorkImages: async ({ where }) => {
      calls.push({ fn: 'listLaundryWorkImages', where });
      return [image];
    },
    findLaundryWorkImageById: async ({ imageId, where, client }) => {
      calls.push({ fn: 'findLaundryWorkImageById', imageId, where, client });
      return { ...image, id: Number(imageId) };
    },
    createLaundryWorkImage: async ({ data, client }) => {
      calls.push({ fn: 'createLaundryWorkImage', data, client });
      return { ...image, ...data };
    },
    updateLaundryWorkImage: async ({ imageId, where, data, client }) => {
      calls.push({ fn: 'updateLaundryWorkImage', imageId, where, data, client });
      return { ...image, id: Number(imageId), ...data };
    },
    clearLaundryWorkCover: async (input) => {
      calls.push({ fn: 'clearLaundryWorkCover', ...input });
      return { count: 1 };
    },
    softDeleteLaundryWorkImage: async ({ imageId, where, client }) => {
      calls.push({ fn: 'softDeleteLaundryWorkImage', imageId, where, client });
      return { ...image, id: Number(imageId), deletedAt: new Date(), isCover: false };
    },
    ...overrides,
  };

  return { repository, calls, image };
};

const createWorkRepository = (currentStatus = 'ITEM_COUNTED') => ({
  findLaundryWorkById: async ({ workId, where, client }) => ({
    id: Number(workId),
    resortId: where.resortId || 10,
    currentStatus,
    client,
  }),
});

const runResortScopedListTest = async () => {
  const { repository, calls } = createImageRepository();
  await withMockedModules({
    '../repositories/laundryWorkImages.repository': repository,
    '../repositories/laundryWorks.repository': createWorkRepository(),
  }, async () => {
    const { listLaundryWorkImages } = require('../src/services/laundryWorkImages.service');
    const images = await listLaundryWorkImages(20, { actor: resortStaffActor });
    assert.equal(images.length, 1);
    const listCall = calls.find((call) => call.fn === 'listLaundryWorkImages');
    assert.deepEqual(listCall.where, { resortId: 10, workId: 20 });
  });
};

const runResortMutationDeniedTest = async () => {
  const { repository } = createImageRepository();
  await withMockedModules({
    '../repositories/laundryWorkImages.repository': repository,
    '../repositories/laundryWorks.repository': createWorkRepository(),
  }, async () => {
    const { createLaundryWorkImage } = require('../src/services/laundryWorkImages.service');
    await assert.rejects(
      () => createLaundryWorkImage(20, { url: 'https://example.com/a.jpg' }, { actor: resortStaffActor }),
      (error) => error.code === 'AUTHORIZATION_POLICY_VIOLATION' && error.statusCode === 403,
    );
  });
};

const runTerminalMutationBlockedTest = async () => {
  const { repository } = createImageRepository();
  await withMockedModules({
    '../repositories/laundryWorkImages.repository': repository,
    '../repositories/laundryWorks.repository': createWorkRepository('CLOSED'),
  }, async () => {
    const { createLaundryWorkImage } = require('../src/services/laundryWorkImages.service');
    await assert.rejects(
      () => createLaundryWorkImage(20, { url: 'https://example.com/a.jpg' }, { actor: laundryStaffActor }),
      (error) => error.statusCode === 409 && /closed or cancelled/.test(error.message),
    );
  });
};

const runRegisterCoverTransactionTest = async () => {
  const { repository, calls } = createImageRepository();
  await withMockedModules({
    '../repositories/laundryWorkImages.repository': repository,
    '../repositories/laundryWorks.repository': createWorkRepository(),
  }, async () => {
    const { createLaundryWorkImage } = require('../src/services/laundryWorkImages.service');
    const result = await createLaundryWorkImage(20, {
      url: 'https://example.com/new.jpg',
      caption: 'New image',
      isCover: true,
    }, { actor: laundryStaffActor });

    assert.equal(result.isCover, true);
    const clearIndex = calls.findIndex((call) => call.fn === 'clearLaundryWorkCover');
    const createIndex = calls.findIndex((call) => call.fn === 'createLaundryWorkImage');
    assert.ok(clearIndex >= 0 && clearIndex < createIndex);
    assert.equal(calls[createIndex].data.uploadedById, 1);
    assert.deepEqual(calls[createIndex].client, { testClient: true });
  });
};

const runCaptionUpdateTest = async () => {
  const { repository, calls } = createImageRepository();
  await withMockedModules({
    '../repositories/laundryWorkImages.repository': repository,
    '../repositories/laundryWorks.repository': createWorkRepository(),
  }, async () => {
    const { updateLaundryWorkImage } = require('../src/services/laundryWorkImages.service');
    const result = await updateLaundryWorkImage(300, { caption: 'Updated', displayOrder: 2 }, { actor: laundryStaffActor });
    assert.equal(result.caption, 'Updated');
    const updateCall = calls.find((call) => call.fn === 'updateLaundryWorkImage');
    assert.deepEqual(updateCall.data, { caption: 'Updated', displayOrder: 2 });
  });
};

const runSetCoverTransactionTest = async () => {
  const { repository, calls } = createImageRepository();
  await withMockedModules({
    '../repositories/laundryWorkImages.repository': repository,
    '../repositories/laundryWorks.repository': createWorkRepository(),
  }, async () => {
    const { setLaundryWorkImageCover } = require('../src/services/laundryWorkImages.service');
    const result = await setLaundryWorkImageCover(300, { actor: laundryStaffActor });
    assert.equal(result.isCover, true);
    const clearCall = calls.find((call) => call.fn === 'clearLaundryWorkCover');
    assert.equal(clearCall.workId, 20);
    assert.equal(clearCall.resortId, 10);
    assert.equal(clearCall.excludeImageId, 300);
  });
};

const runSoftDeleteTest = async () => {
  const { repository, calls } = createImageRepository();
  await withMockedModules({
    '../repositories/laundryWorkImages.repository': repository,
    '../repositories/laundryWorks.repository': createWorkRepository(),
  }, async () => {
    const { softDeleteLaundryWorkImage } = require('../src/services/laundryWorkImages.service');
    const result = await softDeleteLaundryWorkImage(300, { actor: laundryStaffActor });
    assert.equal(result.isCover, false);
    assert.ok(result.deletedAt instanceof Date);
    assert.equal(calls.some((call) => call.fn === 'softDeleteLaundryWorkImage'), true);
  });
};

const run = async () => {
  await runResortScopedListTest();
  await runResortMutationDeniedTest();
  await runTerminalMutationBlockedTest();
  await runRegisterCoverTransactionTest();
  await runCaptionUpdateTest();
  await runSetCoverTransactionTest();
  await runSoftDeleteTest();
  console.log('Laundry Image service contract verification passed.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
