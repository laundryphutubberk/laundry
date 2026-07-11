const assert = require('assert/strict');
const bcrypt = require('bcrypt');

const { prisma } = require('../src/core/prisma');
const worksService = require('../src/services/laundryWorks.service');
const countLinesService = require('../src/services/laundryCountLines.service');
const worksRepository = require('../src/repositories/laundryWorks.repository');

const run = async () => {
  const marker = `VERIFY-RECORD-${Date.now()}`;
  let resortId;
  let userId;
  let itemTypeId;
  let workId;
  let rollbackWorkId;

  try {
    const seeded = await prisma.$transaction(async (tx) => {
      const resort = await tx.resort.create({ data: { name: marker } });
      const user = await tx.user.create({
        data: {
          email: `${marker.toLowerCase()}@example.invalid`,
          passwordHash: await bcrypt.hash('VerificationOnly!123', 4),
          displayName: marker,
          role: 'LAUNDRY_MANAGER',
          workspaceType: 'LAUNDRY',
          active: true,
        },
      });
      const itemType = await tx.laundryItemType.create({ data: { name: marker, category: 'VERIFY', active: true } });
      const work = await tx.laundryWork.create({
        data: {
          workNo: marker,
          resortId: resort.id,
          currentStatus: 'ITEM_COUNTED',
          createdById: user.id,
          bagCount: 2,
          bags: { create: [
            { resortId: resort.id, bagNo: `${marker}-BAG-1`, status: 'COUNTED' },
            { resortId: resort.id, bagNo: `${marker}-BAG-2`, status: 'COUNTED' },
          ] },
        },
        include: { bags: true },
      });
      await tx.laundryCountLine.createMany({
        data: [
          { workId: work.id, bagId: work.bags[0].id, resortId: resort.id, itemTypeId: itemType.id, colorGroup: 'White', quantity: 4, issueQuantity: 1 },
          { workId: work.id, bagId: work.bags[1].id, resortId: resort.id, itemTypeId: itemType.id, colorGroup: null, quantity: 6, issueQuantity: 2 },
        ],
      });
      const rollbackWork = await tx.laundryWork.create({
        data: {
          workNo: `${marker}-ROLLBACK`,
          resortId: resort.id,
          currentStatus: 'COLOR_SORTED',
          createdById: user.id,
          bagCount: 1,
          bags: { create: [{ resortId: resort.id, bagNo: `${marker}-ROLLBACK-BAG`, status: 'COUNTED' }] },
        },
        include: { bags: true },
      });
      await tx.laundryCountLine.create({
        data: { workId: rollbackWork.id, bagId: rollbackWork.bags[0].id, resortId: resort.id, itemTypeId: itemType.id, colorGroup: 'Blue', quantity: 2 },
      });
      return { resort, user, itemType, work, rollbackWork };
    });

    resortId = seeded.resort.id;
    userId = seeded.user.id;
    itemTypeId = seeded.itemType.id;
    workId = seeded.work.id;
    rollbackWorkId = seeded.rollbackWork.id;
    const actor = { userId, role: 'LAUNDRY_MANAGER', workspaceType: 'LAUNDRY', resortId: null, active: true };

    await assert.rejects(
      () => worksService.updateLaundryWorkStatus(workId, { toStatus: 'TYPE_SORTED' }, { actor }),
      (error) => error.statusCode === 409,
    );
    const lines = await prisma.laundryCountLine.findMany({ where: { workId }, orderBy: { id: 'asc' } });
    await assert.rejects(
      () => countLinesService.updateLaundryCountLine(lines[0].id, { quantity: 99 }, { actor }),
      (error) => error.statusCode === 409,
    );

    await prisma.laundryItemType.update({ where: { id: itemTypeId }, data: { active: false } });
    await assert.rejects(
      () => worksService.confirmLaundryWorkSorting(workId, 'TYPE', {}, { actor }),
      (error) => error.statusCode === 409,
    );
    await prisma.laundryItemType.update({ where: { id: itemTypeId }, data: { active: true } });
    await worksService.confirmLaundryWorkSorting(workId, 'TYPE', {}, { actor });
    await assert.rejects(
      () => worksService.confirmLaundryWorkSorting(workId, 'COLOR', {}, { actor }),
      (error) => error.statusCode === 409,
    );
    await countLinesService.updateLaundryCountLine(lines[1].id, { itemTypeId, colorGroup: 'white' }, { actor });
    await worksService.confirmLaundryWorkSorting(workId, 'COLOR', {}, { actor });
    await assert.rejects(
      () => countLinesService.updateLaundryCountLine(lines[0].id, { colorGroup: 'Black' }, { actor }),
      (error) => error.statusCode === 409,
    );

    const concurrent = await Promise.allSettled([
      worksService.recordLaundryWorkData(workId, {}, { actor }),
      worksService.recordLaundryWorkData(workId, {}, { actor }),
    ]);
    assert.equal(concurrent.filter((result) => result.status === 'fulfilled').length, 1);
    assert.equal(concurrent.filter((result) => result.status === 'rejected').length, 1);

    const [recordedWork, movements, summary, logs] = await Promise.all([
      prisma.laundryWork.findUnique({ where: { id: workId } }),
      prisma.linenMovement.findMany({ where: { workId } }),
      prisma.linenInventorySummary.findFirst({ where: { resortId, itemTypeId, colorGroup: 'White' } }),
      prisma.workStatusLog.findMany({ where: { workId } }),
    ]);
    assert.equal(recordedWork.currentStatus, 'DATA_RECORDED');
    assert.equal(movements.length, 1);
    assert.equal(movements[0].quantity, 10);
    assert.equal(summary.totalKnownQty, 10);
    assert.equal(summary.atLaundryQty, 10);
    assert.equal(logs.some((log) => log.toStatus === 'DATA_RECORDED' && log.changedById === userId), true);

    const originalUpsert = worksRepository.upsertInventorySummaries;
    worksRepository.upsertInventorySummaries = async () => { throw new Error('FORCED_ROLLBACK'); };
    await assert.rejects(() => worksService.recordLaundryWorkData(rollbackWorkId, {}, { actor }), /FORCED_ROLLBACK/);
    worksRepository.upsertInventorySummaries = originalUpsert;
    const rollbackWork = await prisma.laundryWork.findUnique({ where: { id: rollbackWorkId } });
    assert.equal(rollbackWork.currentStatus, 'COLOR_SORTED');
    assert.equal(await prisma.linenMovement.count({ where: { workId: rollbackWorkId } }), 0);

    console.log('Sorting and Data Recording DB verification passed.');
  } finally {
    if (resortId) {
      await prisma.linenMovement.deleteMany({ where: { resortId } });
      await prisma.linenInventorySummary.deleteMany({ where: { resortId } });
      await prisma.laundryWork.deleteMany({ where: { resortId } });
      if (userId) await prisma.user.deleteMany({ where: { id: userId } });
      if (itemTypeId) await prisma.laundryItemType.deleteMany({ where: { id: itemTypeId } });
      await prisma.resort.deleteMany({ where: { id: resortId } });
    }
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
