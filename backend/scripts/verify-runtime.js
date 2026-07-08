const fs = require('fs');
const path = require('path');

require('../src/config/env');
require('../src/core/prisma');
require('../src/core/runtimeShutdown');
require('../src/app');
require('../src/routes');

const laundryWorksRoutes = require('../src/routes/laundryWorks.routes');
const laundryWorksService = require('../src/services/laundryWorks.service');
const laundryWorksValidator = require('../src/validators/laundryWorks.validator');

const laundryBagsRoutes = require('../src/routes/laundryBags.routes');
const laundryBagsService = require('../src/services/laundryBags.service');
const laundryBagsValidator = require('../src/validators/laundryBags.validator');
const laundryBagsBusiness = require('../src/domain/laundryBags.business');
const laundryBagsRepository = require('../src/repositories/laundryBags.repository');

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');

const contractPath = path.resolve(__dirname, '../../project-os/04-contracts/BE-03-Laundry-Works-API.md');
const contract = fs.readFileSync(contractPath, 'utf8');

const executionPackagePath = path.resolve(__dirname, '../../project-os/backend/execution/BE-03-REST-API-Layer.md');
const executionPackage = fs.readFileSync(executionPackagePath, 'utf8');

const schemaChecks = [
  ['generator client', schema.includes('generator client')],
  ['datasource provider', schema.includes('provider = "postgresql"')],
  ['LaundryWork model', schema.includes('model LaundryWork')],
  ['LaundryBag model', schema.includes('model LaundryBag')],
  ['WorkStatus enum', schema.includes('enum WorkStatus')],
  ['BagStatus enum', schema.includes('enum BagStatus')],
];

const be03Checks = [
  ['laundry works router loaded', typeof laundryWorksRoutes === 'function'],
  ['listLaundryWorks service exported', typeof laundryWorksService.listLaundryWorks === 'function'],
  ['getLaundryWorkById service exported', typeof laundryWorksService.getLaundryWorkById === 'function'],
  ['createLaundryWork service exported', typeof laundryWorksService.createLaundryWork === 'function'],
  ['updateLaundryWorkStatus service exported', typeof laundryWorksService.updateLaundryWorkStatus === 'function'],
  ['laundry work validator parseRequest exported', typeof laundryWorksValidator.parseRequest === 'function'],
  ['laundry work validator workIdParamSchema exported', typeof laundryWorksValidator.workIdParamSchema === 'object'],
  ['BE-03 contract documents list endpoint', contract.includes('GET /api/laundry/works')],
  ['BE-03 contract documents detail endpoint', contract.includes('GET /api/laundry/works/:workId')],
  ['BE-03 contract documents create endpoint', contract.includes('POST /api/laundry/works')],
  ['BE-03 contract documents status endpoint', contract.includes('PATCH /api/laundry/works/:workId/status')],
  ['BE-03 execution package is active', executionPackage.includes('Status: ACTIVE')],
];

const be05Checks = [
  ['laundry bags router loaded', typeof laundryBagsRoutes === 'function'],
  ['listLaundryBags service exported', typeof laundryBagsService.listLaundryBags === 'function'],
  ['getLaundryBagById service exported', typeof laundryBagsService.getLaundryBagById === 'function'],
  ['createLaundryBag service exported', typeof laundryBagsService.createLaundryBag === 'function'],
  ['updateLaundryBagStatus service exported', typeof laundryBagsService.updateLaundryBagStatus === 'function'],
  ['laundry bag validator parseRequest exported', typeof laundryBagsValidator.parseRequest === 'function'],
  ['laundry bag business receive rule exported', typeof laundryBagsBusiness.assertWorkCanReceiveBag === 'function'],
  ['laundry bag business duplicate rule exported', typeof laundryBagsBusiness.assertUniqueBagNo === 'function'],
  ['laundry bag business status update rule exported', typeof laundryBagsBusiness.buildBagStatusUpdateData === 'function'],
  ['laundry bag repository bagNo lookup exported', typeof laundryBagsRepository.findLaundryBagByBagNo === 'function'],
];

const failedChecks = [...schemaChecks, ...be03Checks, ...be05Checks].filter(([, passed]) => !passed);

if (failedChecks.length > 0) {
  const labels = failedChecks.map(([label]) => label).join(', ');
  throw new Error(`Runtime verification failed: ${labels}`);
}

console.log('Backend runtime verification loaded successfully.');
console.log('BE-03 REST API layer verification loaded successfully.');
console.log('BE-05 Laundry Bag business layer verification loaded successfully.');
