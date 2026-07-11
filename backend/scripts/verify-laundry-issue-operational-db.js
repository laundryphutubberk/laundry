const assert = require('assert/strict');
const bcrypt = require('bcrypt');
const { prisma } = require('../src/core/prisma');
const service = require('../src/services/laundryIssues.service');

const run = async () => {
  const marker = `VERIFY-ISSUE-OPS-${Date.now()}`;
  let resortId; let userId; let itemTypeId;
  try {
    const seed = await prisma.$transaction(async (tx) => {
      const resort = await tx.resort.create({ data: { name: marker } });
      const user = await tx.user.create({ data: { email: `${marker.toLowerCase()}@example.invalid`, passwordHash: await bcrypt.hash('VerificationOnly!123', 4), displayName: marker, role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', active: true } });
      const itemType = await tx.laundryItemType.create({ data: { name: marker, category: 'VERIFY_ISSUE_OPS', active: true } });
      const work = await tx.laundryWork.create({ data: { workNo: marker, resortId: resort.id, currentStatus: 'BAG_OPENED', createdById: user.id, bagCount: 1, bags: { create: [{ resortId: resort.id, bagNo: `${marker}-BAG`, status: 'OPENED' }] } }, include: { bags: true } });
      const line = await tx.laundryCountLine.create({ data: { workId: work.id, bagId: work.bags[0].id, resortId: resort.id, itemTypeId: itemType.id, colorGroup: 'White', quantity: 8 } });
      const summary = await tx.linenInventorySummary.create({ data: { resortId: resort.id, itemTypeId: itemType.id, colorGroup: 'White', totalKnownQty: 8, atLaundryQty: 8 } });
      return { resort, user, itemType, work, bag: work.bags[0], line, summary };
    });
    resortId = seed.resort.id; userId = seed.user.id; itemTypeId = seed.itemType.id;
    const actor = { id: userId, userId, role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', resortId: null, active: true };
    const issue = await service.createLaundryIssue(seed.work.id, { bagId: seed.bag.id, countLineId: seed.line.id, issueType: 'DAMAGED', quantity: 3, description: 'Operational verification' }, { actor });
    assert.equal(issue.status, 'OPEN');
    const listed = await service.listLaundryIssues(seed.work.id, {}, { actor });
    assert.equal(listed.length, 1);
    const updated = await service.updateLaundryIssue(issue.id, { quantity: 2, description: 'Updated operational verification' }, { actor });
    assert.equal(updated.quantity, 2);
    const resolved = await service.resolveLaundryIssue(issue.id, { resolutionNote: 'Separated for manual handling' }, { actor });
    assert.equal(resolved.status, 'RESOLVED');
    await assert.rejects(() => service.updateLaundryIssue(issue.id, { quantity: 1 }, { actor }), (e) => e.statusCode === 409);
    const [lineAfter, summaryAfter] = await Promise.all([prisma.laundryCountLine.findUnique({ where: { id: seed.line.id } }), prisma.linenInventorySummary.findUnique({ where: { id: seed.summary.id } })]);
    assert.equal(lineAfter.quantity, 8); assert.equal(summaryAfter.totalKnownQty, 8); assert.equal(summaryAfter.atLaundryQty, 8);
    console.log('Laundry Issue operational DB verification passed.');
  } finally {
    if (resortId) { await prisma.issueReport.deleteMany({ where: { resortId } }); await prisma.linenInventorySummary.deleteMany({ where: { resortId } }); await prisma.laundryWork.deleteMany({ where: { resortId } }); await prisma.user.deleteMany({ where: { id: userId } }); await prisma.laundryItemType.deleteMany({ where: { id: itemTypeId } }); await prisma.resort.deleteMany({ where: { id: resortId } }); }
    await prisma.$disconnect();
  }
};
run().catch((error) => { console.error(error); process.exitCode = 1; });
