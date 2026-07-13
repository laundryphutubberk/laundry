const { prisma } = require('../src/core/prisma');
const storage = require('../src/adapters/cloudinaryImageStorage.adapter');
const run = async () => {
  const works = await prisma.laundryWork.findMany({ where: { workNo: { startsWith: 'BROWSER-IMAGE-' } }, select: { id: true, resortId: true, createdById: true } });
  const images = await prisma.laundryWorkImage.findMany({ where: { workId: { in: works.map((x) => x.id) }, provider: 'CLOUDINARY' }, select: { publicId: true } });
  for (const image of images) if (image.publicId) await storage.deleteLaundryWorkImage(image.publicId);
  const resortIds = [...new Set(works.map((x) => x.resortId))]; const userIds = [...new Set(works.map((x) => x.createdById).filter(Boolean))];
  await prisma.$transaction(async (tx) => { await tx.laundryWorkImage.deleteMany({ where: { workId: { in: works.map((x) => x.id) } } }); await tx.laundryWork.deleteMany({ where: { id: { in: works.map((x) => x.id) } } }); await tx.user.deleteMany({ where: { id: { in: userIds } } }); await tx.resort.deleteMany({ where: { id: { in: resortIds } } }); });
  console.log(`Cleaned ${works.length} Laundry Image browser Work(s).`);
};
run().catch((e) => { console.error(e); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
