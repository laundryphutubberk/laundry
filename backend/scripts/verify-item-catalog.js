const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');

const repository = require('../src/repositories/laundryItemTypes.repository');
const service = require('../src/services/laundryItemTypes.service');
const validators = require('../src/validators/laundryItemTypes.validator');
const { prisma } = require('../src/core/prisma');

const manager = { userId: 1, role: 'LAUNDRY_MANAGER', workspaceType: 'LAUNDRY', active: true };
const staff = { userId: 2, role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', active: true };
const resortActor = { userId: 3, role: 'RESORT_STAFF', workspaceType: 'RESORT', resortId: 9, active: true };
const originals = { ...repository };
const expectStatus = async (operation, statusCode) => assert.rejects(operation, (error) => error.statusCode === statusCode);

async function main() {
  let listInput;
  repository.listLaundryItemTypes = async (input) => {
    listInput = input;
    return { items: [{ id: 1, name: 'Towel', active: true }], total: 21 };
  };
  const defaultList = await service.listLaundryItemTypes({}, { actor: staff });
  assert.equal(listInput.where.active, true, 'Work counting default must remain active-only');
  assert.deepEqual(defaultList.pagination, { total: 21, skip: 0, take: 50 });

  await service.listLaundryItemTypes({ active: 'all', search: ' towel ', skip: '10', take: '5' }, { actor: staff });
  assert.equal(listInput.where.active, undefined);
  assert.equal(listInput.where.OR.length, 2);
  assert.equal(listInput.where.OR[0].name.contains, 'towel');
  assert.equal(listInput.skip, 10);
  assert.equal(listInput.take, 5);
  await service.listLaundryItemTypes({ active: 'false' }, { actor: staff });
  assert.equal(listInput.where.active, false);
  await expectStatus(() => service.listLaundryItemTypes({}, { actor: resortActor }), 403);

  repository.transaction = async (callback) => callback({ testClient: true });
  repository.findConflictingLaundryItemType = async () => null;
  repository.createLaundryItemType = async ({ data }) => ({ id: 10, ...data });
  const created = await service.createLaundryItemType({ name: ' Bath Towel ', category: ' Linen ', weightPerPieceKg: 0.45 }, { actor: manager });
  assert.equal(created.name, 'Bath Towel');
  assert.equal(created.category, 'Linen');
  assert.equal(created.active, true);
  await expectStatus(() => service.createLaundryItemType({ name: 'Forbidden' }, { actor: staff }), 403);

  repository.findConflictingLaundryItemType = async () => ({ id: 99 });
  await expectStatus(() => service.createLaundryItemType({ name: 'Duplicate', category: null }, { actor: manager }), 409);

  repository.findConflictingLaundryItemType = async () => null;
  repository.findLaundryItemTypeById = async () => ({ id: 10, name: 'Bath Towel', category: 'Linen', active: true });
  repository.updateLaundryItemType = async ({ itemTypeId, data }) => ({ id: itemTypeId, ...data });
  const deactivated = await service.updateLaundryItemType(10, { active: false }, { actor: manager });
  assert.equal(deactivated.active, false);
  const reactivated = await service.updateLaundryItemType(10, { active: true }, { actor: manager });
  assert.equal(reactivated.active, true);
  await expectStatus(() => service.updateLaundryItemType(10, { name: 'Forbidden' }, { actor: staff }), 403);
  repository.findLaundryItemTypeById = async () => null;
  await expectStatus(() => service.updateLaundryItemType(999, { active: false }, { actor: manager }), 404);

  const parsedList = validators.parseRequest(validators.listLaundryItemTypesQuerySchema, { active: 'all', search: ' towel ', skip: '0', take: '20' });
  assert.equal(parsedList.search, 'towel');
  assert.throws(() => validators.parseRequest(validators.createLaundryItemTypeBodySchema, { name: '', internal: 'secret' }), (error) => error.statusCode === 400);
  assert.throws(() => validators.parseRequest(validators.updateLaundryItemTypeBodySchema, {}), (error) => error.statusCode === 400);
  assert.throws(() => validators.parseRequest(validators.createLaundryItemTypeBodySchema, { name: 'Bad Weight', weightPerPieceKg: 1000 }), (error) => error.statusCode === 400);

  const repositorySource = fs.readFileSync(path.resolve(__dirname, '../src/repositories/laundryItemTypes.repository.js'), 'utf8');
  const routeSource = fs.readFileSync(path.resolve(__dirname, '../src/routes/laundryItemTypes.routes.js'), 'utf8');
  const schemaSource = fs.readFileSync(path.resolve(__dirname, '../prisma/schema.prisma'), 'utf8');
  assert.equal(repositorySource.includes('deleteLaundryItemType'), false, 'Historical catalog records must not be hard deleted');
  assert.equal(routeSource.includes('router.delete'), false, 'Catalog DELETE route must remain unavailable');
  assert.ok(routeSource.includes("router.patch('/:itemTypeId'"));
  assert.ok(schemaSource.includes('itemType   LaundryItemType @relation(fields: [itemTypeId], references: [id])'), 'Count Lines must preserve ItemType references');
  console.log('ITEM_CATALOG_VERIFY PASS');
}

main()
  .catch((error) => { console.error(error); process.exitCode = 1; })
  .finally(async () => {
    Object.assign(repository, originals);
    await prisma.$disconnect();
  });
