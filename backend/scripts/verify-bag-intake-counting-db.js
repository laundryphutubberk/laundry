const assert = require('assert/strict');

const { prisma } = require('../src/core/prisma');
const { USER_ROLES, WORKSPACE_TYPES } = require('../src/core/actor');
const { createLaundryWork, updateLaundryWorkStatus } = require('../src/services/laundryWorks.service');
const { updateLaundryBagStatus } = require('../src/services/laundryBags.service');
const {
  createLaundryCountLine,
  completeLaundryCounting,
} = require('../src/services/laundryCountLines.service');

const run = async () => {
  const marker = `VERIFY-COUNTING-${Date.now()}`;
  const resort = await prisma.resort.findFirst({ where: { active: true } });
  const user = await prisma.user.findFirst({
    where: {
      active: true,
      role: { in: [USER_ROLES.LAUNDRY_OWNER, USER_ROLES.LAUNDRY_MANAGER, USER_ROLES.LAUNDRY_STAFF] },
    },
  });
  let itemType = await prisma.laundryItemType.findFirst({ where: { active: true } });
  let createdItemTypeId = null;
  if (!itemType) {
    itemType = await prisma.laundryItemType.create({
      data: { name: marker, category: 'VERIFICATION', active: true },
    });
    createdItemTypeId = itemType.id;
  }
  assert.ok(resort && user, 'Active Resort and Laundry user are required');

  const actor = {
    userId: user.id,
    role: user.role,
    workspaceType: WORKSPACE_TYPES.LAUNDRY,
    resortId: null,
    active: true,
  };

  try {
    const created = await createLaundryWork({
      resortId: resort.id,
      workNo: marker,
      bagCount: 2,
      note: marker,
    }, { actor });
    await updateLaundryWorkStatus(created.id, { toStatus: 'FACTORY_RECEIVED' }, { actor });

    const work = await prisma.laundryWork.findUnique({
      where: { id: created.id },
      include: { bags: { orderBy: { bagNo: 'asc' } } },
    });
    const [bagA, bagB] = work.bags;
    await updateLaundryBagStatus(work.id, bagA.id, { toStatus: 'OPENED' }, { actor });

    const duplicateRace = await Promise.allSettled([
      createLaundryCountLine(work.id, {
        bagId: bagA.id,
        itemTypeId: itemType.id,
        colorGroup: 'White',
        quantity: 3,
      }, { actor }),
      createLaundryCountLine(work.id, {
        bagId: bagA.id,
        itemTypeId: itemType.id,
        colorGroup: 'white',
        quantity: 3,
      }, { actor }),
    ]);
    assert.equal(duplicateRace.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(duplicateRace.filter((result) => result.status === 'rejected').length, 1);

    await assert.rejects(
      () => completeLaundryCounting(work.id, {}, { actor }),
      (error) => error.statusCode === 409,
    );

    await updateLaundryBagStatus(work.id, bagB.id, { toStatus: 'OPENED' }, { actor });
    await createLaundryCountLine(work.id, {
      bagId: bagB.id,
      itemTypeId: itemType.id,
      colorGroup: 'Blue',
      quantity: 4,
    }, { actor });
    await completeLaundryCounting(work.id, { note: marker }, { actor });

    const completed = await prisma.laundryWork.findUnique({
      where: { id: work.id },
      include: { bags: true, countLines: true, statusLogs: true },
    });
    assert.equal(completed.currentStatus, 'ITEM_COUNTED');
    assert.equal(completed.bags.every((bag) => bag.status === 'COUNTED'), true);
    assert.equal(completed.countLines.length, 2);
    assert.equal(completed.statusLogs.some((log) => log.toStatus === 'BAG_OPENED' && log.changedById === user.id), true);
    assert.equal(completed.statusLogs.some((log) => log.toStatus === 'ITEM_COUNTED' && log.changedById === user.id), true);

    console.log('Bag Intake and Counting DB verification passed.');
  } finally {
    await prisma.laundryWork.deleteMany({ where: { workNo: marker } });
    if (createdItemTypeId) await prisma.laundryItemType.delete({ where: { id: createdItemTypeId } });
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
