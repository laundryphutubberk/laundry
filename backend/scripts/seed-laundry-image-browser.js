const bcrypt = require('bcrypt');
const { prisma } = require('../src/core/prisma');

const run = async () => {
  const runId = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const password = `LaundryBrowser!${runId}`;
  const passwordHash = await bcrypt.hash(password, 12);
  const resortName = `Browser Verification Resort ${runId}`;

  const result = await prisma.$transaction(async (tx) => {
    const resort = await tx.resort.create({ data: { name: resortName } });
    const laundryUser = await tx.user.create({
      data: {
        email: `laundry-image-${runId}@example.invalid`,
        passwordHash,
        displayName: 'Laundry Image Browser Verification',
        role: 'LAUNDRY_STAFF',
        workspaceType: 'LAUNDRY',
        active: true,
      },
    });
    const resortUser = await tx.user.create({
      data: {
        email: `resort-image-${runId}@example.invalid`,
        passwordHash,
        displayName: 'Resort Image Browser Verification',
        role: 'RESORT_STAFF',
        workspaceType: 'RESORT',
        resortId: resort.id,
        active: true,
      },
    });
    const mutableWork = await tx.laundryWork.create({
      data: {
        workNo: `BROWSER-IMG-OPEN-${runId}`,
        resortId: resort.id,
        currentStatus: 'ITEM_COUNTED',
        createdById: laundryUser.id,
        note: 'Project OS V2 Laundry Image browser verification — mutable Work',
      },
    });
    const closedWork = await tx.laundryWork.create({
      data: {
        workNo: `BROWSER-IMG-CLOSED-${runId}`,
        resortId: resort.id,
        currentStatus: 'CLOSED',
        closedAt: new Date(),
        createdById: laundryUser.id,
        note: 'Project OS V2 Laundry Image browser verification — terminal Work',
      },
    });

    await tx.laundryWorkImage.createMany({
      data: [
        {
          workId: mutableWork.id,
          resortId: resort.id,
          url: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=900&q=80',
          provider: 'BROWSER_VERIFY',
          originalName: 'browser-verification-cover.jpg',
          caption: 'Browser verification cover',
          displayOrder: 0,
          isCover: true,
          uploadedById: laundryUser.id,
        },
        {
          workId: mutableWork.id,
          resortId: resort.id,
          url: 'https://images.unsplash.com/photo-1551761429-8232f9f5955c?auto=format&fit=crop&w=900&q=80',
          provider: 'BROWSER_VERIFY',
          originalName: 'browser-verification-secondary.jpg',
          caption: 'Browser verification secondary image',
          displayOrder: 1,
          isCover: false,
          uploadedById: laundryUser.id,
        },
        {
          workId: closedWork.id,
          resortId: resort.id,
          url: 'https://images.unsplash.com/photo-1545173168-9f1947eebb7f?auto=format&fit=crop&w=900&q=80',
          provider: 'BROWSER_VERIFY',
          originalName: 'browser-verification-closed.jpg',
          caption: 'Terminal Work read-only evidence',
          displayOrder: 0,
          isCover: true,
          uploadedById: laundryUser.id,
        },
      ],
    });

    return { resort, laundryUser, resortUser, mutableWork, closedWork };
  });

  console.log(JSON.stringify({
    runId,
    password,
    resortId: result.resort.id,
    laundry: { email: result.laundryUser.email, workId: result.mutableWork.id, closedWorkId: result.closedWork.id },
    resort: { email: result.resortUser.email },
  }, null, 2));
};

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
