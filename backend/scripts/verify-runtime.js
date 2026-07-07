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
  ['WorkStatus enum', schema.includes('enum WorkStatus')],
];

const be03Checks = [
  ['laundry works router loaded', typeof laundryWorksRoutes === 'function'],
  ['listLaundryWorks service exported', typeof laundryWorksService.listLaundryWorks === 'function'],
  ['getLaundryWorkById service exported', typeof laundryWorksService.getLaundryWorkById === 'function'],
  ['createLaundryWork service exported', typeof laundryWorksService.createLaundryWork === 'function'],
  ['updateLaundryWorkStatus service exported', typeof laundryWorksService.updateLaundryWorkStatus === 'function'],
  ['laundry work validator parseRequest exported', typeof laundryWorksValidator.parseRequest === 'function'],
  ['BE-03 contract documents list endpoint', contract.includes('GET /api/laundry/works')],
  ['BE-03 contract documents detail endpoint', contract.includes('GET /api/laundry/works/:workId')],
  ['BE-03 contract documents create endpoint', contract.includes('POST /api/laundry/works')],
  ['BE-03 contract documents status endpoint', contract.includes('PATCH /api/laundry/works/:workId/status')],
  ['BE-03 execution package is active', executionPackage.includes('Status: ACTIVE')],
];

const failedChecks = [...schemaChecks, ...be03Checks].filter(([, passed]) => !passed);

if (failedChecks.length > 0) {
  const labels = failedChecks.map(([label]) => label).join(', ');
  throw new Error(`Runtime verification failed: ${labels}`);
}

console.log('Backend runtime verification loaded successfully.');
console.log('BE-03 REST API layer verification loaded successfully.');
