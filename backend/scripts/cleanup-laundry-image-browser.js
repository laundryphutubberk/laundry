const { prisma } = require('../src/core/prisma');

const runId = process.argv[2];
if (!runId || !/^\d{14}$/.test(runId)) {
  console.error('Usage: node scripts/cleanup-laundry-image-browser.js <14-digit-run-id>');
  process.exit(1);
}

const run = async () => {
  const workPrefix = `BROWSER-IMG-`;
  const emailSuffix = `-${runId}@example.invalid`;

  const works = await prisma.laundryWork.findMany({
    where: { workNo: { startsWith: workPrefix, endsWith: runId } },
    select: { id: true },
  });
  const workIds = works.map((work) => work.id);

  await prisma.$transaction(async (tx) => {
    if (workIds.length) await tx.laundryWork.deleteMany({ where: { id: { in: workIds } } });
    await tx.user.deleteMany({ where: { email: { endsWith: emailSuffix } } });
    await tx.resort.deleteMany({ where: { name: `Browser Verification Resort ${runId}` } });
  });

  console.log(`Laundry Image browser verification seed ${runId} removed.`);
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
