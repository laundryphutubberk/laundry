const bcrypt = require('bcrypt');
const { prisma } = require('../src/core/prisma');
const run = async () => {
  const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14); const password = `LaundryIssue!${runId}`;
  const result = await prisma.$transaction(async (tx) => {
    const resort = await tx.resort.create({ data: { name: `Issue Browser Resort ${runId}` } });
    const user = await tx.user.create({ data: { email: `laundry-issue-${runId}@example.invalid`, passwordHash: await bcrypt.hash(password, 12), displayName: 'Issue Operational Browser Test', role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', active: true } });
    const itemType = await tx.laundryItemType.create({ data: { name: `Issue Linen ${runId}`, category: 'BROWSER_ISSUE_OPS', active: true } });
    const work = await tx.laundryWork.create({ data: { workNo: `BROWSER-ISSUE-${runId}`, resortId: resort.id, currentStatus: 'BAG_OPENED', bagCount: 1, createdById: user.id, note: `Issue operational browser verification ${runId}`, bags: { create: [{ resortId: resort.id, bagNo: `BROWSER-ISSUE-${runId}-BAG`, status: 'OPENED' }] } }, include: { bags: true } });
    await tx.laundryCountLine.create({ data: { workId: work.id, bagId: work.bags[0].id, resortId: resort.id, itemTypeId: itemType.id, colorGroup: 'White', quantity: 10 } });
    return { user, work };
  });
  console.log(JSON.stringify({ runId, email: result.user.email, password, workId: result.work.id, url: `http://127.0.0.1:5173/workspace/laundry/works/${result.work.id}` }, null, 2));
};
run().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
