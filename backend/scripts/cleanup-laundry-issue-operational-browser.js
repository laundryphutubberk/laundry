const { prisma } = require('../src/core/prisma');
const run = async () => {
  const works = await prisma.laundryWork.findMany({ where: { workNo: { startsWith: 'BROWSER-ISSUE-' } }, select: { id: true, resortId: true, createdById: true } });
  const resortIds = [...new Set(works.map((x) => x.resortId))]; const userIds = [...new Set(works.map((x) => x.createdById).filter(Boolean))];
  await prisma.$transaction(async (tx) => { await tx.issueReport.deleteMany({ where: { resortId: { in: resortIds } } }); await tx.laundryWork.deleteMany({ where: { id: { in: works.map((x) => x.id) } } }); await tx.user.deleteMany({ where: { id: { in: userIds } } }); await tx.laundryItemType.deleteMany({ where: { category: 'BROWSER_ISSUE_OPS' } }); await tx.resort.deleteMany({ where: { id: { in: resortIds } } }); });
  console.log(`Cleaned ${works.length} Laundry Issue browser Work(s).`);
};
run().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
