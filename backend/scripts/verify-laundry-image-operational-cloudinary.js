const assert = require('assert/strict');
const bcrypt = require('bcrypt');
const { v2: cloudinary } = require('cloudinary');
const { prisma } = require('../src/core/prisma');
const service = require('../src/services/laundryWorkImages.service');
const storage = require('../src/adapters/cloudinaryImageStorage.adapter');

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
const run = async () => {
  const marker = `VERIFY-IMAGE-UPLOAD-${Date.now()}`; let resortId; let userId; let publicId;
  try {
    const seed = await prisma.$transaction(async (tx) => {
      const resort = await tx.resort.create({ data: { name: marker } });
      const user = await tx.user.create({ data: { email: `${marker.toLowerCase()}@example.invalid`, passwordHash: await bcrypt.hash('VerificationOnly!123', 4), displayName: marker, role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', active: true } });
      const makeWork = (suffix, currentStatus) => tx.laundryWork.create({ data: { workNo: `${marker}-${suffix}`, resortId: resort.id, currentStatus, createdById: user.id } });
      return { resort, user, active: await makeWork('ACTIVE', 'BAG_OPENED'), closed: await makeWork('CLOSED', 'CLOSED'), cancelled: await makeWork('CANCELLED', 'CANCELLED') };
    });
    resortId = seed.resort.id; userId = seed.user.id;
    const actor = { id: userId, userId, role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', resortId: null, active: true };
    const file = { buffer: PNG, originalname: 'verification.png', mimetype: 'image/png', size: PNG.length };
    const workBefore = await prisma.laundryWork.findUnique({ where: { id: seed.active.id } });
    const image = await service.uploadLaundryWorkImage(seed.active.id, file, { caption: 'Cloudinary operational verification' }, { actor });
    publicId = image.publicId; assert.equal(image.provider, 'CLOUDINARY'); assert.match(image.url, /^https:\/\//);
    const listed = await service.listLaundryWorkImages(seed.active.id, { actor }); assert.equal(listed.some((item) => item.id === image.id), true);
    const asset = await cloudinary.api.resource(publicId, { resource_type: 'image' }); assert.equal(asset.public_id, publicId);
    const workAfter = await prisma.laundryWork.findUnique({ where: { id: seed.active.id } }); assert.equal(workAfter.currentStatus, workBefore.currentStatus); assert.equal(workAfter.issueCount, workBefore.issueCount);
    await assert.rejects(() => service.uploadLaundryWorkImage(seed.closed.id, file, {}, { actor }), (e) => e.statusCode === 409);
    await assert.rejects(() => service.uploadLaundryWorkImage(seed.cancelled.id, file, {}, { actor }), (e) => e.statusCode === 409);
    await service.softDeleteLaundryWorkImage(image.id, { actor }); publicId = null;
    assert.equal(await prisma.laundryWorkImage.count({ where: { id: image.id, deletedAt: null } }), 0);
    console.log('Laundry Image Cloudinary operational verification passed.');
  } finally {
    if (publicId) await storage.deleteLaundryWorkImage(publicId).catch(() => undefined);
    if (resortId) { await prisma.laundryWorkImage.deleteMany({ where: { resortId } }); await prisma.laundryWork.deleteMany({ where: { resortId } }); await prisma.user.deleteMany({ where: { id: userId } }); await prisma.resort.deleteMany({ where: { id: resortId } }); }
    await prisma.$disconnect();
  }
};
run().catch((error) => { console.error(error); process.exitCode = 1; });
