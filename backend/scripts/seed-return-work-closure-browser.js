const bcrypt = require('bcrypt');
const { prisma } = require('../src/core/prisma');
const run = async () => {
  const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const password = `LaundryReturn!${runId}`;
  const result = await prisma.$transaction(async (tx) => {
    const resort = await tx.resort.create({ data: { name: `Return Browser Resort ${runId}` } });
    const user = await tx.user.create({ data: { email: `laundry-return-${runId}@example.invalid`, passwordHash: await bcrypt.hash(password, 12), displayName: 'Return Closure Browser Verification', role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', active: true } });
    const itemType = await tx.laundryItemType.create({ data: { name: `Return Linen ${runId}`, category: 'BROWSER_RETURN', active: true } });
    const work = await tx.laundryWork.create({ data: { workNo: `BROWSER-RETURN-${runId}`, resortId: resort.id, currentStatus: 'DATA_RECORDED', bagCount: 1, createdById: user.id, note: `Return/closure browser verification ${runId}`, bags: { create: [{ resortId: resort.id, bagNo: `BROWSER-RETURN-${runId}-BAG-1`, status: 'COUNTED' }] } }, include: { bags: true } });
    await tx.laundryCountLine.create({ data: { workId: work.id, bagId: work.bags[0].id, resortId: resort.id, itemTypeId: itemType.id, colorGroup: 'White', quantity: 5 } });
    await tx.linenMovement.create({ data: { resortId: resort.id, workId: work.id, itemTypeId: itemType.id, colorGroup: 'White', movementType: 'COUNTED_AT_LAUNDRY', quantity: 5 } });
    await tx.linenInventorySummary.create({ data: { resortId: resort.id, itemTypeId: itemType.id, colorGroup: 'White', totalKnownQty: 5, atLaundryQty: 5 } });
    return { user, work };
  });
  console.log(JSON.stringify({ runId, email: result.user.email, password, workId: result.work.id, url: `http://127.0.0.1:5173/workspace/laundry/works/${result.work.id}` }, null, 2));
};
run().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
