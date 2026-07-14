const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const repository = require('../src/repositories/resorts.repository');
const service = require('../src/services/resorts.service');
const {
  parseRequest,
  listResortsQuerySchema,
  updateResortBodySchema,
} = require('../src/validators/resorts.validator');

const manager = { id: 1, userId: 1, role: 'LAUNDRY_MANAGER', workspaceType: 'LAUNDRY', active: true };
const staff = { id: 2, userId: 2, role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', active: true };
const resortActor = { id: 3, userId: 3, role: 'RESORT_OWNER', workspaceType: 'RESORT', resortId: 9, active: true };
const original = {
  listResorts: repository.listResorts,
  createResort: repository.createResort,
  findResortById: repository.findResortById,
  countActiveWorksByResort: repository.countActiveWorksByResort,
  updateResort: repository.updateResort,
  transaction: repository.transaction,
};

const expectStatus = async (operation, statusCode) => {
  await assert.rejects(operation, (error) => error.statusCode === statusCode);
};

async function main() {
  let listInput;
  repository.listResorts = async (input) => {
    listInput = input;
    return { items: [{ id: 7, name: 'Palm Resort', active: false }], total: 21 };
  };
  repository.transaction = async (callback) => callback({ testClient: true });

  const listed = await service.listResorts({ active: 'false', search: ' palm ', skip: '10', take: '5' }, { actor: staff });
  assert.equal(listed.items.length, 1);
  assert.deepEqual(listed.pagination, { total: 21, skip: 10, take: 5 });
  assert.equal(listInput.where.active, false);
  assert.equal(listInput.where.OR.length, 4);
  assert.deepEqual(listInput.where.OR[0], { name: { contains: 'palm', mode: 'insensitive' } });
  await expectStatus(() => service.listResorts({}, { actor: resortActor }), 403);

  repository.createResort = async ({ data }) => ({ id: 8, ...data });
  const created = await service.createResort({ name: ' New Resort ' }, { actor: manager });
  assert.equal(created.name, 'New Resort');
  assert.equal(created.active, true);
  await expectStatus(() => service.createResort({ name: 'Forbidden' }, { actor: staff }), 403);

  let activeWorkCountCalls = 0;
  let updateData;
  repository.findResortById = async () => ({ id: 7, name: 'Palm Resort', contactName: null, contactPhone: null, address: null, active: true });
  repository.countActiveWorksByResort = async () => { activeWorkCountCalls += 1; return 0; };
  repository.updateResort = async ({ resortId, data }) => { updateData = data; return { id: resortId, ...data }; };

  const updated = await service.updateResort(7, { name: 'Palm Beach', contactPhone: '0800000000' }, { actor: manager });
  assert.equal(updated.name, 'Palm Beach');
  assert.equal(updated.contactPhone, '0800000000');
  await expectStatus(() => service.updateResort(7, { name: 'Forbidden' }, { actor: staff }), 403);

  const deactivated = await service.updateResort(7, { active: false }, { actor: manager });
  assert.equal(deactivated.active, false);
  assert.equal(activeWorkCountCalls, 1);

  repository.countActiveWorksByResort = async () => 2;
  await expectStatus(() => service.updateResort(7, { active: false }, { actor: manager }), 400);

  repository.findResortById = async () => ({ id: 7, name: 'Palm Resort', contactName: null, contactPhone: null, address: null, active: false });
  activeWorkCountCalls = 0;
  repository.countActiveWorksByResort = async () => { activeWorkCountCalls += 1; return 0; };
  const reactivated = await service.updateResort(7, { active: true }, { actor: manager });
  assert.equal(reactivated.active, true);
  assert.equal(activeWorkCountCalls, 0);

  repository.findResortById = async () => null;
  await expectStatus(() => service.updateResort(999, { active: false }, { actor: manager }), 404);

  assert.throws(
    () => parseRequest(updateResortBodySchema, { active: 'false' }),
    (error) => error.statusCode === 400 && !JSON.stringify(error.details).includes('password'),
  );
  assert.throws(() => parseRequest(updateResortBodySchema, {}), (error) => error.statusCode === 400);
  const query = parseRequest(listResortsQuerySchema, { search: 'hotel', active: 'true', skip: '0', take: '20' });
  assert.equal(query.search, 'hotel');

  assert.equal(typeof repository.deleteResort, 'undefined', 'Historical Resort deletion must remain unavailable');
  const routeSource = fs.readFileSync(path.resolve(__dirname, '../src/routes/resorts.routes.js'), 'utf8');
  const controllerSource = fs.readFileSync(path.resolve(__dirname, '../src/controllers/resorts.controller.js'), 'utf8');
  assert.ok(routeSource.includes("router.patch('/:resortId', updateResortController)"), 'Resort update route is required');
  assert.equal(routeSource.includes('router.delete'), false, 'Resort hard delete route must remain unavailable');
  assert.ok(controllerSource.includes('updateResortBodySchema'), 'Update controller must validate request bodies');
  assert.equal(updateData.active, true);
  console.log('RESORT_MANAGEMENT_VERIFY PASS');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => Object.assign(repository, original));
