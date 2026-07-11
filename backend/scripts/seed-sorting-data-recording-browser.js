const bcrypt = require('bcrypt');
const { prisma } = require('../src/core/prisma');

const run = async () => {
  const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const password = `LaundryRecording!${runId}`;
  const passwordHash = await bcrypt.hash(password, 12);
  const result = await prisma.$transaction(async (tx) => {
    const resort = await tx.resort.create({ data: { name: `Recording Browser Resort ${runId}` } });
    const user = await tx.user.create({ data: {
      email: `laundry-recording-${runId}@example.invalid`, passwordHash,
      displayName: 'Sorting Data Recording Browser Verification', role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', active: true,
    } });
    const itemTypes = await Promise.all([
      tx.laundryItemType.create({ data: { name: `ผ้าเช็ดตัว ${runId}`, category: 'BROWSER_RECORD', active: true } }),
      tx.laundryItemType.create({ data: { name: `ผ้าปูที่นอน ${runId}`, category: 'BROWSER_RECORD', active: true } }),
    ]);
    const work = await tx.laundryWork.create({ data: {
      workNo: `BROWSER-RECORD-${runId}`, resortId: resort.id, currentStatus: 'ITEM_COUNTED', bagCount: 2, createdById: user.id,
      note: `Project OS V2 Sorting/Data Recording browser verification ${runId}`,
      bags: { create: [1, 2].map((number) => ({ resortId: resort.id, bagNo: `BROWSER-RECORD-${runId}-BAG-${number}`, status: 'COUNTED' })) },
    }, include: { bags: true } });
    await tx.laundryCountLine.createMany({ data: [
      { workId: work.id, bagId: work.bags[0].id, resortId: resort.id, itemTypeId: itemTypes[0].id, colorGroup: 'ขาว', quantity: 4 },
      { workId: work.id, bagId: work.bags[1].id, resortId: resort.id, itemTypeId: itemTypes[1].id, colorGroup: null, quantity: 6, issueQuantity: 1 },
    ] });
    return { resort, user, itemTypes, work };
  });
  console.log(JSON.stringify({
    runId, email: result.user.email, password, workId: result.work.id, workNo: result.work.workNo,
    itemTypes: result.itemTypes.map(({ id, name }) => ({ id, name })),
  }, null, 2));
};

run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
