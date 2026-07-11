const assert = require('assert/strict');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';

const { prisma } = require('../src/core/prisma');
const imagesRepository = require('../src/repositories/laundryWorkImages.repository');

const ROLLBACK_SENTINEL = 'LAUNDRY_IMAGE_DB_VERIFY_ROLLBACK';

const run = async () => {
  const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const workNo = `VERIFY-IMG-${suffix}`;

  try {
    await prisma.$transaction(async (tx) => {
      const resort = await tx.resort.create({ data: { name: `Verify Resort ${suffix}` } });
      const user = await tx.user.create({
        data: {
          email: `verify-image-${suffix}@example.invalid`,
          passwordHash: 'verification-only-not-a-real-credential',
          role: 'LAUNDRY_STAFF',
          workspaceType: 'LAUNDRY',
          active: true,
        },
      });
      const work = await tx.laundryWork.create({
        data: {
          workNo,
          resortId: resort.id,
          currentStatus: 'ITEM_COUNTED',
          createdById: user.id,
        },
      });

      const first = await imagesRepository.createLaundryWorkImage({
        data: {
          workId: work.id,
          resortId: resort.id,
          url: 'https://example.invalid/verify-first.jpg',
          provider: 'VERIFY',
          caption: 'First',
          displayOrder: 2,
          isCover: true,
          uploadedById: user.id,
        },
        client: tx,
      });
      const second = await imagesRepository.createLaundryWorkImage({
        data: {
          workId: work.id,
          resortId: resort.id,
          url: 'https://example.invalid/verify-second.jpg',
          provider: 'VERIFY',
          caption: 'Second',
          displayOrder: 1,
          uploadedById: user.id,
        },
        client: tx,
      });

      let active = await imagesRepository.listLaundryWorkImages({ where: { workId: work.id, resortId: resort.id }, client: tx });
      assert.deepEqual(active.map((image) => image.id), [first.id, second.id]);

      const updated = await imagesRepository.updateLaundryWorkImage({
        imageId: second.id,
        where: { workId: work.id, resortId: resort.id },
        data: { caption: 'Second updated', displayOrder: 0 },
        client: tx,
      });
      assert.equal(updated.caption, 'Second updated');
      assert.equal(updated.displayOrder, 0);

      await imagesRepository.clearLaundryWorkCover({
        workId: work.id,
        resortId: resort.id,
        excludeImageId: second.id,
        client: tx,
      });
      const cover = await imagesRepository.updateLaundryWorkImage({
        imageId: second.id,
        where: { workId: work.id, resortId: resort.id },
        data: { isCover: true },
        client: tx,
      });
      assert.equal(cover.isCover, true);

      active = await imagesRepository.listLaundryWorkImages({ where: { workId: work.id, resortId: resort.id }, client: tx });
      assert.equal(active.filter((image) => image.isCover).length, 1);
      assert.equal(active[0].id, second.id);

      const deleted = await imagesRepository.softDeleteLaundryWorkImage({
        imageId: second.id,
        where: { workId: work.id, resortId: resort.id },
        client: tx,
      });
      assert.ok(deleted.deletedAt instanceof Date);
      assert.equal(deleted.isCover, false);

      active = await imagesRepository.listLaundryWorkImages({ where: { workId: work.id, resortId: resort.id }, client: tx });
      assert.deepEqual(active.map((image) => image.id), [first.id]);

      throw new Error(ROLLBACK_SENTINEL);
    });
  } catch (error) {
    if (error.message !== ROLLBACK_SENTINEL) throw error;
  }

  const persistedWork = await prisma.laundryWork.findUnique({ where: { workNo } });
  assert.equal(persistedWork, null, 'Verification transaction must roll back all test records');
  console.log('Laundry Image database persistence verification passed with rollback.');
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
