const { prisma } = require('../src/core/prisma');
const runId = process.argv[2];
if (!runId || !/^\d{14}$/.test(runId)) {
  console.error('Usage: node scripts/cleanup-sorting-data-recording-browser.js <14-digit-run-id>');
  process.exit(1);
}
const run = async () => {
  const resort = await prisma.resort.findFirst({ where: { name: `Recording Browser Resort ${runId}` } });
  if (resort) {
    await prisma.linenMovement.deleteMany({ where: { resortId: resort.id } });
    await prisma.linenInventorySummary.deleteMany({ where: { resortId: resort.id } });
    await prisma.laundryWork.deleteMany({ where: { resortId: resort.id } });
    await prisma.user.deleteMany({ where: { resortId: resort.id } });
  }
  await prisma.user.deleteMany({ where: { email: `laundry-recording-${runId}@example.invalid` } });
  await prisma.laundryItemType.deleteMany({ where: { category: 'BROWSER_RECORD', name: { endsWith: runId } } });
  if (resort) await prisma.resort.delete({ where: { id: resort.id } });
  console.log(`Sorting/Data Recording browser seed ${runId} removed.`);
};
run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
