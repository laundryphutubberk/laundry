const assert = require('assert/strict');
const bcrypt = require('bcrypt');
const { prisma } = require('../src/core/prisma');
const { createApp } = require('../src/app');

const run = async () => {
  const marker = `VERIFY-TIMELINE-${Date.now()}`; let resortId; let laundryUserId; let resortUserId; let server;
  try {
    const password = 'TimelineVerification!123';
    const seed = await prisma.$transaction(async (tx) => {
      const resort = await tx.resort.create({ data: { name: marker } });
      const laundryUser = await tx.user.create({ data: { email: `${marker.toLowerCase()}@example.invalid`, passwordHash: await bcrypt.hash(password, 4), displayName: marker, role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', active: true } });
      const resortUser = await tx.user.create({ data: { email: `resort-${marker.toLowerCase()}@example.invalid`, passwordHash: await bcrypt.hash(password, 4), displayName: `Resort ${marker}`, role: 'RESORT_STAFF', workspaceType: 'RESORT', resortId: resort.id, active: true } });
      const makeWork = (suffix, status) => tx.laundryWork.create({ data: { workNo: `${marker}-${suffix}`, resortId: resort.id, currentStatus: status, createdById: laundryUser.id, ...(status === 'CLOSED' ? { returnedAt: new Date(Date.now() + 6000), closedAt: new Date(Date.now() + 7000) } : {}) } });
      const active = await makeWork('ACTIVE', 'BAG_OPENED'); const closed = await makeWork('CLOSED', 'CLOSED'); const cancelled = await makeWork('CANCELLED', 'CANCELLED');
      const bag = await tx.laundryBag.create({ data: { workId: closed.id, resortId: resort.id, bagNo: `${marker}-BAG`, status: 'OPENED', receivedAt: new Date(Date.now() + 1000), openedAt: new Date(Date.now() + 2000) } });
      await tx.workStatusLog.createMany({ data: [
        { workId: closed.id, fromStatus: 'DRAFT', toStatus: 'BAG_RECEIVED', changedAt: new Date(Date.now() + 1000), changedById: laundryUser.id, changedByName: marker },
        { workId: closed.id, fromStatus: 'COLOR_SORTED', toStatus: 'DATA_RECORDED', changedAt: new Date(Date.now() + 5000), changedById: laundryUser.id, changedByName: marker },
        { workId: closed.id, fromStatus: 'DATA_RECORDED', toStatus: 'RETURNED', changedAt: new Date(Date.now() + 6000), changedById: laundryUser.id, changedByName: marker },
        { workId: closed.id, fromStatus: 'RETURNED', toStatus: 'CLOSED', changedAt: new Date(Date.now() + 7000), changedById: laundryUser.id, changedByName: marker },
      ] });
      await tx.issueReport.create({ data: { workId: closed.id, resortId: resort.id, bagId: bag.id, issueType: 'DAMAGED', quantity: 1, description: 'Timeline issue', status: 'RESOLVED', reportedById: laundryUser.id, reportedAt: new Date(Date.now() + 3000), resolvedAt: new Date(Date.now() + 4000) } });
      await tx.laundryWorkImage.create({ data: { workId: closed.id, resortId: resort.id, url: 'https://example.invalid/timeline.jpg', provider: 'VERIFY', caption: 'Timeline image', uploadedById: laundryUser.id } });
      return { resort, laundryUser, resortUser, active, closed, cancelled };
    });
    resortId = seed.resort.id; laundryUserId = seed.laundryUser.id; resortUserId = seed.resortUser.id;
    const countsBefore = await Promise.all([prisma.laundryWork.count({ where: { resortId } }), prisma.laundryBag.count({ where: { resortId } }), prisma.issueReport.count({ where: { resortId } }), prisma.laundryWorkImage.count({ where: { resortId } }), prisma.laundryCountLine.count({ where: { resortId } }), prisma.linenInventorySummary.count({ where: { resortId } }), prisma.linenMovement.count({ where: { resortId } })]);
    server = createApp().listen(0); await new Promise((resolve) => server.once('listening', resolve)); const base = `http://127.0.0.1:${server.address().port}`;
    const login = async (email) => (await (await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) })).json()).data.token;
    const token = await login(seed.laundryUser.email); const headers = { Authorization: `Bearer ${token}` };
    for (const work of [seed.active, seed.closed, seed.cancelled]) assert.equal((await fetch(`${base}/api/laundry/works/${work.id}/timeline`, { headers })).status, 200);
    assert.equal((await fetch(`${base}/api/laundry/works/${seed.closed.id}/timeline`)).status, 401);
    const resortToken = await login(seed.resortUser.email); assert.equal((await fetch(`${base}/api/laundry/works/${seed.closed.id}/timeline`, { headers: { Authorization: `Bearer ${resortToken}` } })).status, 403);
    assert.equal((await fetch(`${base}/api/laundry/works/99999999/timeline`, { headers })).status, 404);
    const response = await (await fetch(`${base}/api/laundry/works/${seed.closed.id}/timeline`, { headers })).json(); const events = response.data;
    assert.ok(events.length >= 9); for (let i = 1; i < events.length; i += 1) assert.ok(new Date(events[i - 1].occurredAt) <= new Date(events[i].occurredAt));
    for (const type of ['WORK_CREATED', 'BAG_RECEIVED', 'BAG_OPENED', 'ISSUE_CREATED', 'ISSUE_RESOLVED', 'IMAGE_CREATED', 'DATA_RECORDED', 'RETURNED', 'CLOSED']) assert.ok(events.some((event) => event.eventType === type), type);
    const countsAfter = await Promise.all([prisma.laundryWork.count({ where: { resortId } }), prisma.laundryBag.count({ where: { resortId } }), prisma.issueReport.count({ where: { resortId } }), prisma.laundryWorkImage.count({ where: { resortId } }), prisma.laundryCountLine.count({ where: { resortId } }), prisma.linenInventorySummary.count({ where: { resortId } }), prisma.linenMovement.count({ where: { resortId } })]); assert.deepEqual(countsAfter, countsBefore);
    console.log('Laundry Timeline DB/HTTP verification passed.');
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (resortId) { await prisma.laundryWorkImage.deleteMany({ where: { resortId } }); await prisma.issueReport.deleteMany({ where: { resortId } }); await prisma.laundryWork.deleteMany({ where: { resortId } }); await prisma.user.deleteMany({ where: { id: { in: [laundryUserId, resortUserId].filter(Boolean) } } }); await prisma.resort.deleteMany({ where: { id: resortId } }); } await prisma.$disconnect();
  }
};
run().catch((error) => { console.error(error); process.exitCode = 1; });
