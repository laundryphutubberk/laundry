const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const repository = require('../src/repositories/laundryIssues.repository');
const worksRepository = require('../src/repositories/laundryWorks.repository');
const service = require('../src/services/laundryIssues.service');
const { parseRequest, listGlobalLaundryIssuesQuerySchema } = require('../src/validators/laundryIssues.validator');
const { prisma } = require('../src/core/prisma');
const actor = { userId: 7, id: 7, role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', active: true };
const originals = { list: repository.listGlobalLaundryIssues, transaction: repository.transaction, find: repository.findLaundryIssueById, update: repository.updateLaundryIssue, count: repository.updateWorkIssueCount, work: worksRepository.findLaundryWorkById };

async function main() {
  let captured;
  repository.listGlobalLaundryIssues = async (input) => { captured = input; return { items: [{ id: 1 }], total: 11 }; };
  const listed = await service.listGlobalLaundryIssues({ active: 'true', issueType: 'MISSING', search: 'LW-42', skip: '5', take: '5' }, { actor });
  assert.deepEqual(listed.pagination, { total: 11, skip: 5, take: 5 });
  assert.deepEqual(captured.where.AND[0], { status: { in: ['OPEN', 'REVIEWING'] } });
  assert.deepEqual(captured.where.AND[1], { issueType: 'MISSING' });
  assert.equal(captured.where.AND[2].OR[1].work.workNo.contains, 'LW-42');
  const parsed = parseRequest(listGlobalLaundryIssuesQuerySchema, { active: 'false', take: '10', search: '  resort  ' });
  assert.equal(parsed.search, 'resort');
  assert.throws(() => parseRequest(listGlobalLaundryIssuesQuerySchema, { priority: 'HIGH' }), (error) => error.statusCode === 400);
  await assert.rejects(() => service.listGlobalLaundryIssues({}, { actor: { ...actor, role: 'RESORT_STAFF', workspaceType: 'RESORT' } }), (error) => error.statusCode === 403);
  let updateInput;
  repository.transaction = async (callback) => callback({});
  repository.findLaundryIssueById = async () => ({ id: 9, workId: 3, resortId: 2, status: 'RESOLVED' });
  repository.updateLaundryIssue = async (input) => { updateInput = input; return { id: 9, workId: 3, status: 'OPEN' }; };
  repository.updateWorkIssueCount = async () => {};
  worksRepository.findLaundryWorkById = async () => ({ id: 3, resortId: 2, currentStatus: 'WASHING' });
  const reopened = await service.reopenLaundryIssue(9, { actor });
  assert.equal(reopened.status, 'OPEN');
  assert.deepEqual(updateInput.data, { status: 'OPEN', resolvedAt: null });
  repository.findLaundryIssueById = async () => ({ id: 9, workId: 3, resortId: 2, status: 'OPEN' });
  await assert.rejects(() => service.reopenLaundryIssue(9, { actor }), (error) => error.statusCode === 409);
  repository.findLaundryIssueById = async () => null;
  await assert.rejects(() => service.reopenLaundryIssue(9, { actor }), (error) => error.statusCode === 404);
  const routes = fs.readFileSync(path.resolve(__dirname, '../src/routes/index.js'), 'utf8');
  const repositorySource = fs.readFileSync(path.resolve(__dirname, '../src/repositories/laundryIssues.repository.js'), 'utf8');
  assert.match(routes, /router\.get\('\/laundry\/issues'/);
  assert.match(routes, /router\.patch\('\/laundry\/issues\/:issueId\/reopen'/);
  assert.equal(/router\.delete\([^\n]*laundry\/issues/.test(routes), false);
  assert.match(repositorySource, /workNo/); assert.match(repositorySource, /resort:/); assert.match(repositorySource, /claim:/);
  console.log('ISSUE_CENTER_VERIFY PASS');
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => {
  repository.listGlobalLaundryIssues = originals.list; repository.transaction = originals.transaction; repository.findLaundryIssueById = originals.find; repository.updateLaundryIssue = originals.update; repository.updateWorkIssueCount = originals.count; worksRepository.findLaundryWorkById = originals.work; await prisma.$disconnect();
});
