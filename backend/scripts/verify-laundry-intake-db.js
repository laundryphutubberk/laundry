const assert = require('assert/strict');

const { prisma } = require('../src/core/prisma');
const { createLaundryWork } = require('../src/services/laundryWorks.service');
const { USER_ROLES, WORKSPACE_TYPES } = require('../src/core/actor');

const run = async () => {
  const marker = `VERIFY-INTAKE-${Date.now()}`;
  const resort = await prisma.resort.findFirst({ where: { active: true } });
  const user = await prisma.user.findFirst({
    where: {
      active: true,
      role: { in: [USER_ROLES.LAUNDRY_OWNER, USER_ROLES.LAUNDRY_MANAGER, USER_ROLES.LAUNDRY_STAFF] },
    },
  });

  assert.ok(resort, 'An active Resort is required for DB verification');
  assert.ok(user, 'An active Laundry user is required for DB verification');

  const actor = {
    userId: user.id,
    role: user.role,
    workspaceType: WORKSPACE_TYPES.LAUNDRY,
    resortId: null,
    active: true,
  };

  try {
    const atomicWorkNo = `${marker}-ATOMIC`;
    const atomicWork = await createLaundryWork(
      { resortId: resort.id, workNo: atomicWorkNo, bagCount: 2 },
      { actor },
    );
    const persistedAtomicWork = await prisma.laundryWork.findUnique({
      where: { workNo: atomicWorkNo },
      include: { bags: { orderBy: { bagNo: 'asc' } }, statusLogs: true },
    });

    assert.equal(atomicWork.currentStatus, 'BAG_RECEIVED');
    assert.equal(persistedAtomicWork.bagCount, 2);
    assert.equal(persistedAtomicWork.bags.length, 2);
    assert.equal(persistedAtomicWork.statusLogs.length, 1);
    assert.equal(persistedAtomicWork.statusLogs[0].changedById, user.id);

    const rollbackWorkNo = `${marker}-ROLLBACK`;
    await assert.rejects(
      () => prisma.$transaction((tx) => tx.laundryWork.create({
        data: {
          workNo: rollbackWorkNo,
          resortId: resort.id,
          bagCount: 2,
          currentStatus: 'BAG_RECEIVED',
          bags: {
            create: [
              { resortId: resort.id, bagNo: 'DUPLICATE-BAG' },
              { resortId: resort.id, bagNo: 'DUPLICATE-BAG' },
            ],
          },
        },
      })),
    );
    assert.equal(await prisma.laundryWork.count({ where: { workNo: rollbackWorkNo } }), 0);

    const concurrentWorks = await Promise.all([
      createLaundryWork({ resortId: resort.id, bagCount: 0, note: marker }, { actor }),
      createLaundryWork({ resortId: resort.id, bagCount: 0, note: marker }, { actor }),
    ]);
    assert.notEqual(concurrentWorks[0].workNo, concurrentWorks[1].workNo);

    console.log('Laundry Intake DB atomicity and Work-number concurrency verification passed.');
  } finally {
    await prisma.laundryWork.deleteMany({
      where: {
        OR: [
          { workNo: { startsWith: marker } },
          { note: marker },
        ],
      },
    });
    await prisma.$disconnect();
  }
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
