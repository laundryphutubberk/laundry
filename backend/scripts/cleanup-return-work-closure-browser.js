const { prisma } = require('../src/core/prisma');
const run = async () => {
  const works = await prisma.laundryWork.findMany({ where: { workNo: { startsWith: 'BROWSER-RETURN-' } }, select: { id: true, resortId: true, createdById: true } });
  const resortIds = [...new Set(works.map((x) => x.resortId))]; const userIds = [...new Set(works.map((x) => x.createdById).filter(Boolean))];
  await prisma.$transaction(async (tx) => { await tx.linenMovement.deleteMany({ where: { resortId: { in: resortIds } } }); await tx.linenInventorySummary.deleteMany({ where: { resortId: { in: resortIds } } }); await tx.laundryWork.deleteMany({ where: { id: { in: works.map((x) => x.id) } } }); await tx.user.deleteMany({ where: { id: { in: userIds } } }); await tx.laundryItemType.deleteMany({ where: { category: 'BROWSER_RETURN' } }); await tx.resort.deleteMany({ where: { id: { in: resortIds } } }); });
  console.log(`Cleaned ${works.length} return/closure browser Work(s).`);
};
run().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
