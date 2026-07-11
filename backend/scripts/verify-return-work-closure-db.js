const assert = require('assert/strict');
const bcrypt = require('bcrypt');
const { prisma } = require('../src/core/prisma');
const service = require('../src/services/laundryWorks.service');
const repository = require('../src/repositories/laundryWorks.repository');

const run = async () => {
  const marker = `VERIFY-RETURN-${Date.now()}`;
  let resortId; let userId; let itemTypeId;
  try {
    const seed = await prisma.$transaction(async (tx) => {
      const resort = await tx.resort.create({ data: { name: marker } });
      const user = await tx.user.create({ data: { email: `${marker.toLowerCase()}@example.invalid`, passwordHash: await bcrypt.hash('VerificationOnly!123', 4), displayName: marker, role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', active: true } });
      const itemType = await tx.laundryItemType.create({ data: { name: marker, category: 'VERIFY', active: true } });
      const makeWork = async (suffix, status) => {
        const work = await tx.laundryWork.create({ data: { workNo: `${marker}-${suffix}`, resortId: resort.id, currentStatus: status, createdById: user.id, bagCount: 1, bags: { create: [{ resortId: resort.id, bagNo: `${marker}-${suffix}-BAG`, status: 'COUNTED' }] } }, include: { bags: true } });
        await tx.laundryCountLine.create({ data: { workId: work.id, bagId: work.bags[0].id, resortId: resort.id, itemTypeId: itemType.id, colorGroup: suffix, quantity: 4 } });
        if (status === 'DATA_RECORDED') {
          await tx.linenMovement.create({ data: { resortId: resort.id, workId: work.id, itemTypeId: itemType.id, colorGroup: suffix, movementType: 'COUNTED_AT_LAUNDRY', quantity: 4 } });
          await tx.linenInventorySummary.create({ data: { resortId: resort.id, itemTypeId: itemType.id, colorGroup: suffix, totalKnownQty: 4, atLaundryQty: 4 } });
        }
        return work;
      };
      return { resort, user, itemType, ready: await makeWork('READY', 'DATA_RECORDED'), early: await makeWork('EARLY', 'COLOR_SORTED'), rollback: await makeWork('ROLLBACK', 'DATA_RECORDED') };
    });
    ({ id: resortId } = seed.resort); ({ id: userId } = seed.user); ({ id: itemTypeId } = seed.itemType);
    const actor = { userId, role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', resortId: null, active: true };
    await assert.rejects(() => service.confirmLaundryWorkReturn(seed.early.id, {}, { actor }), (e) => e.statusCode === 409);
    await assert.rejects(() => service.closeLaundryWork(seed.ready.id, {}, { actor }), (e) => e.statusCode === 409);
    await assert.rejects(() => service.updateLaundryWorkStatus(seed.ready.id, { toStatus: 'RETURNED' }, { actor }), (e) => e.statusCode === 409);
    const concurrentReturn = await Promise.allSettled([service.confirmLaundryWorkReturn(seed.ready.id, {}, { actor }), service.confirmLaundryWorkReturn(seed.ready.id, {}, { actor })]);
    assert.equal(concurrentReturn.filter((x) => x.status === 'fulfilled').length, 1);
    assert.equal(await prisma.linenMovement.count({ where: { workId: seed.ready.id, movementType: 'RETURNED_TO_RESORT' } }), 1);
    const summary = await prisma.linenInventorySummary.findFirst({ where: { resortId, itemTypeId, colorGroup: 'READY' } });
    assert.deepEqual([summary.atLaundryQty, summary.atResortQty, summary.returnedQty], [0, 4, 4]);
    const concurrentClose = await Promise.allSettled([service.closeLaundryWork(seed.ready.id, {}, { actor }), service.closeLaundryWork(seed.ready.id, {}, { actor })]);
    assert.equal(concurrentClose.filter((x) => x.status === 'fulfilled').length, 1);
    const closed = await prisma.laundryWork.findUnique({ where: { id: seed.ready.id }, include: { statusLogs: true } });
    assert.equal(closed.currentStatus, 'CLOSED'); assert.ok(closed.returnedAt); assert.ok(closed.closedAt);
    assert.equal(closed.statusLogs.filter((x) => ['RETURNED', 'CLOSED'].includes(x.toStatus)).length, 2);
    const original = repository.applyReturnedInventory;
    repository.applyReturnedInventory = async () => { throw new Error('FORCED_RETURN_ROLLBACK'); };
    await assert.rejects(() => service.confirmLaundryWorkReturn(seed.rollback.id, {}, { actor }), /FORCED_RETURN_ROLLBACK/);
    repository.applyReturnedInventory = original;
    const rolledBack = await prisma.laundryWork.findUnique({ where: { id: seed.rollback.id } });
    assert.equal(rolledBack.currentStatus, 'DATA_RECORDED');
    assert.equal(await prisma.linenMovement.count({ where: { workId: seed.rollback.id, movementType: 'RETURNED_TO_RESORT' } }), 0);
    console.log('Return and Work Closure DB verification passed.');
  } finally {
    if (resortId) { await prisma.linenMovement.deleteMany({ where: { resortId } }); await prisma.linenInventorySummary.deleteMany({ where: { resortId } }); await prisma.laundryWork.deleteMany({ where: { resortId } }); await prisma.user.deleteMany({ where: { id: userId } }); await prisma.laundryItemType.deleteMany({ where: { id: itemTypeId } }); await prisma.resort.deleteMany({ where: { id: resortId } }); }
    await prisma.$disconnect();
  }
};
run().catch((error) => { console.error(error); process.exitCode = 1; });
