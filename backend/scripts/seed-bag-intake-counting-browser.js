const bcrypt = require('bcrypt');
const { prisma } = require('../src/core/prisma');

const run = async () => {
  const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const password = `LaundryCounting!${runId}`;
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const resort = await tx.resort.create({ data: { name: `Counting Browser Resort ${runId}` } });
    const user = await tx.user.create({
      data: {
        email: `laundry-counting-${runId}@example.invalid`,
        passwordHash,
        displayName: 'Bag Counting Browser Verification',
        role: 'LAUNDRY_STAFF',
        workspaceType: 'LAUNDRY',
        active: true,
      },
    });
    const itemTypes = await Promise.all([
      tx.laundryItemType.create({ data: { name: `ผ้าเช็ดตัว ${runId}`, category: 'BROWSER_VERIFY', active: true } }),
      tx.laundryItemType.create({ data: { name: `ผ้าปูที่นอน ${runId}`, category: 'BROWSER_VERIFY', active: true } }),
    ]);
    const work = await tx.laundryWork.create({
      data: {
        workNo: `BROWSER-COUNT-${runId}`,
        resortId: resort.id,
        bagCount: 2,
        currentStatus: 'FACTORY_RECEIVED',
        createdById: user.id,
        note: `Project OS V2 Bag Intake and Counting browser verification ${runId}`,
        bags: {
          create: [1, 2].map((number) => ({
            resortId: resort.id,
            bagNo: `BROWSER-COUNT-${runId}-BAG-${String(number).padStart(3, '0')}`,
            receivedAt: new Date(),
          })),
        },
      },
    });
    return { resort, user, itemTypes, work };
  });

  console.log(JSON.stringify({
    runId,
    email: result.user.email,
    password,
    workId: result.work.id,
    workNo: result.work.workNo,
    itemTypes: result.itemTypes.map(({ id, name }) => ({ id, name })),
  }, null, 2));
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
