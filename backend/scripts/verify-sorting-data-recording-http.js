const assert = require('assert/strict');
const bcrypt = require('bcrypt');

const { prisma } = require('../src/core/prisma');
const { createApp } = require('../src/app');

const run = async () => {
  const marker = `VERIFY-RECORD-HTTP-${Date.now()}`;
  let resortId;
  let userId;
  let resortUserId;
  let itemTypeId;
  let workId;
  let server;

  try {
    const password = 'VerificationOnly!123';
    const seeded = await prisma.$transaction(async (tx) => {
      const resort = await tx.resort.create({ data: { name: marker } });
      const user = await tx.user.create({ data: {
        email: `${marker.toLowerCase()}@example.invalid`,
        passwordHash: await bcrypt.hash(password, 4),
        displayName: marker,
        role: 'LAUNDRY_STAFF',
        workspaceType: 'LAUNDRY',
        active: true,
      } });
      const resortUser = await tx.user.create({ data: {
        email: `resort-${marker.toLowerCase()}@example.invalid`,
        passwordHash: await bcrypt.hash(password, 4),
        displayName: `Resort ${marker}`,
        role: 'RESORT_STAFF',
        workspaceType: 'RESORT',
        resortId: resort.id,
        active: true,
      } });
      const itemType = await tx.laundryItemType.create({ data: { name: marker, category: 'VERIFY', active: true } });
      const work = await tx.laundryWork.create({ data: {
        workNo: marker,
        resortId: resort.id,
        currentStatus: 'ITEM_COUNTED',
        bagCount: 1,
        createdById: user.id,
        bags: { create: [{ resortId: resort.id, bagNo: `${marker}-BAG`, status: 'COUNTED' }] },
      }, include: { bags: true } });
      await tx.laundryCountLine.create({ data: {
        workId: work.id,
        bagId: work.bags[0].id,
        resortId: resort.id,
        itemTypeId: itemType.id,
        colorGroup: 'White',
        quantity: 5,
      } });
      return { resort, user, resortUser, itemType, work };
    });
    resortId = seeded.resort.id;
    userId = seeded.user.id;
    resortUserId = seeded.resortUser.id;
    itemTypeId = seeded.itemType.id;
    workId = seeded.work.id;

    server = await new Promise((resolve) => {
      const listening = createApp().listen(0, '127.0.0.1', () => resolve(listening));
    });
    const base = `http://127.0.0.1:${server.address().port}/api`;
    const login = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: seeded.user.email, password }),
    });
    const session = await login.json();
    assert.equal(login.status, 200);
    const headers = { authorization: `Bearer ${session.data.token}`, 'content-type': 'application/json' };

    const generic = await fetch(`${base}/laundry/works/${workId}/status`, {
      method: 'PATCH', headers, body: JSON.stringify({ toStatus: 'TYPE_SORTED' }),
    });
    assert.equal(generic.status, 409);

    const resortLogin = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: seeded.resortUser.email, password }),
    });
    const resortSession = await resortLogin.json();
    const resortDenied = await fetch(`${base}/laundry/works/${workId}/confirm-type-sorting`, {
      method: 'POST',
      headers: { authorization: `Bearer ${resortSession.data.token}`, 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(resortDenied.status, 403);

    for (const command of ['confirm-type-sorting', 'confirm-color-sorting', 'record-data']) {
      const response = await fetch(`${base}/laundry/works/${workId}/${command}`, {
        method: 'POST', headers, body: JSON.stringify({}),
      });
      assert.equal(response.status, 200, `${command} should return 200`);
    }
    const replay = await fetch(`${base}/laundry/works/${workId}/record-data`, {
      method: 'POST', headers, body: JSON.stringify({}),
    });
    assert.equal(replay.status, 409);
    console.log('Sorting and Data Recording HTTP verification passed.');
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (resortId) {
      await prisma.linenMovement.deleteMany({ where: { resortId } });
      await prisma.linenInventorySummary.deleteMany({ where: { resortId } });
      await prisma.laundryWork.deleteMany({ where: { resortId } });
      if (userId) await prisma.user.deleteMany({ where: { id: userId } });
      if (resortUserId) await prisma.user.deleteMany({ where: { id: resortUserId } });
      if (itemTypeId) await prisma.laundryItemType.deleteMany({ where: { id: itemTypeId } });
      await prisma.resort.deleteMany({ where: { id: resortId } });
    }
    await prisma.$disconnect();
  }
};

run().catch((error) => { console.error(error); process.exitCode = 1; });
