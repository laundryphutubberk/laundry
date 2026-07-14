const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const repository = require('../src/repositories/laundryWorks.repository');
const service = require('../src/services/laundryWorks.service');
const { parseRequest, listLaundryWorksQuerySchema } = require('../src/validators/laundryWorks.validator');
const { prisma } = require('../src/core/prisma');

const actor = { userId: 7, role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', active: true };
const resortActor = { userId: 8, role: 'RESORT_STAFF', workspaceType: 'RESORT', resortId: 19, active: true };
const originalList = repository.listLaundryWorks;

async function main() {
  const { start, end } = service.getBangkokOperationalDayRange(new Date('2026-07-14T18:30:00.000Z'));
  assert.equal(start.toISOString(), '2026-07-14T17:00:00.000Z');
  assert.equal(end.toISOString(), '2026-07-15T17:00:00.000Z');

  const today = service.buildLaundryWorkWhere({ actor, queue: 'today', now: new Date('2026-07-14T18:30:00.000Z') });
  assert.equal(today.AND[0].OR.length, 3);
  assert.equal(today.AND[0].OR[0].createdAt.gte.toISOString(), start.toISOString());
  assert.equal(today.AND[0].OR[2].updatedAt.lt.toISOString(), end.toISOString());

  const pending = service.buildLaundryWorkWhere({ actor, queue: 'pending' });
  assert.deepEqual(pending.AND[0], { currentStatus: { notIn: ['CLOSED', 'CANCELLED'] } });

  const ready = service.buildLaundryWorkWhere({ actor, queue: 'ready' });
  assert.deepEqual(ready.AND[0], { currentStatus: 'DATA_RECORDED' });

  const scopedSearch = service.buildLaundryWorkWhere({ actor: resortActor, search: ' palm ' });
  assert.equal(scopedSearch.resortId, 19, 'Existing actor Resort scope must be retained');
  assert.deepEqual(scopedSearch.AND[0].OR[0], { workNo: { contains: ' palm ', mode: 'insensitive' } });
  assert.deepEqual(scopedSearch.AND[0].OR[1], { resort: { name: { contains: ' palm ', mode: 'insensitive' } } });

  let captured;
  repository.listLaundryWorks = async (input) => {
    captured = input;
    return { items: [{ id: 1 }], total: 23 };
  };
  const listed = await service.listLaundryWorks({ queue: 'ready', search: 'LW-', skip: '10', take: '5' }, { actor });
  assert.deepEqual(listed.pagination, { total: 23, skip: 10, take: 5 });
  assert.equal(captured.where.AND[0].currentStatus, 'DATA_RECORDED');
  assert.equal(captured.where.AND[1].OR[0].workNo.contains, 'LW-');

  const parsed = parseRequest(listLaundryWorksQuerySchema, { queue: 'pending', search: '  beach  ', skip: '0', take: '20' });
  assert.equal(parsed.search, 'beach');
  assert.throws(() => parseRequest(listLaundryWorksQuerySchema, { queue: 'overdue' }), (error) => error.statusCode === 400);

  const validatorSource = fs.readFileSync(path.resolve(__dirname, '../src/validators/laundryWorks.validator.js'), 'utf8');
  assert.equal(validatorSource.includes("'OVERDUE'"), false, 'Queues must not introduce lifecycle statuses');
  console.log('WORK_QUEUE_VERIFY PASS');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    repository.listLaundryWorks = originalList;
    await prisma.$disconnect();
  });
