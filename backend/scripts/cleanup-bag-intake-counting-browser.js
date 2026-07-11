const { prisma } = require('../src/core/prisma');

const runId = process.argv[2];
if (!runId || !/^\d{14}$/.test(runId)) {
  console.error('Usage: node scripts/cleanup-bag-intake-counting-browser.js <14-digit-run-id>');
  process.exit(1);
}

const run = async () => {
  await prisma.$transaction(async (tx) => {
    await tx.laundryWork.deleteMany({ where: { workNo: `BROWSER-COUNT-${runId}` } });
    await tx.laundryItemType.deleteMany({ where: { category: 'BROWSER_VERIFY', name: { endsWith: runId } } });
    await tx.user.deleteMany({ where: { email: `laundry-counting-${runId}@example.invalid` } });
    await tx.resort.deleteMany({ where: { name: `Counting Browser Resort ${runId}` } });
  });
  console.log(`Bag Intake and Counting browser seed ${runId} removed.`);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());
