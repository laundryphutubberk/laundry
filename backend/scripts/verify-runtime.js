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
const laundryWorksBusiness = require('../src/domain/laundryWorks.business');
const laundryWorksBusinessRepository = require('../src/repositories/laundryWorksBusiness.repository');

const laundryBagsRoutes = require('../src/routes/laundryBags.routes');
const laundryBagsService = require('../src/services/laundryBags.service');
const laundryBagsValidator = require('../src/validators/laundryBags.validator');
const laundryBagsBusiness = require('../src/domain/laundryBags.business');
const laundryBagsRepository = require('../src/repositories/laundryBags.repository');

const laundryCountLinesService = require('../src/services/laundryCountLines.service');
const laundryCountLinesBusiness = require('../src/domain/laundryCountLines.business');
const laundryCountLinesRepository = require('../src/repositories/laundryCountLines.repository');

const linenMovementsService = require('../src/services/linenMovements.service');
const linenMovementsBusiness = require('../src/domain/linenMovements.business');
const linenMovementsRepository = require('../src/repositories/linenMovements.repository');

const issueReportsService = require('../src/services/issueReports.service');
const issueReportsBusiness = require('../src/domain/issueReports.business');
const issueReportsRepository = require('../src/repositories/issueReports.repository');

const laundryMachineLoadRulesService = require('../src/services/laundryMachineLoadRules.service');
const laundryMachineLoadRulesBusiness = require('../src/domain/laundryMachineLoadRules.business');
const laundryMachineLoadRulesRepository = require('../src/repositories/laundryMachineLoadRules.repository');

const washLoadPlansService = require('../src/services/washLoadPlans.service');
const washLoadPlansBusiness = require('../src/domain/washLoadPlans.business');
const washLoadPlansRepository = require('../src/repositories/washLoadPlans.repository');

const resortsService = require('../src/services/resorts.service');
const resortsBusiness = require('../src/domain/resorts.business');
const resortsRepository = require('../src/repositories/resorts.repository');

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');

const contractPath = path.resolve(__dirname, '../../project-os/04-contracts/BE-03-Laundry-Works-API.md');
const contract = fs.readFileSync(contractPath, 'utf8');

const executionPackagePath = path.resolve(__dirname, '../../project-os/backend/execution/BE-03-REST-API-Layer.md');
const executionPackage = fs.readFileSync(executionPackagePath, 'utf8');

const schemaChecks = [
  ['generator client', schema.includes('generator client')],
  ['datasource provider', schema.includes('provider = "postgresql"')],
  ['Resort model', schema.includes('model Resort')],
  ['LaundryWork model', schema.includes('model LaundryWork')],
  ['LaundryBag model', schema.includes('model LaundryBag')],
  ['LaundryCountLine model', schema.includes('model LaundryCountLine')],
  ['LinenMovement model', schema.includes('model LinenMovement')],
  ['IssueReport model', schema.includes('model IssueReport')],
  ['LaundryMachineLoadRule model', schema.includes('model LaundryMachineLoadRule')],
  ['WashLoadPlan model', schema.includes('model WashLoadPlan')],
  ['WorkStatus enum', schema.includes('enum WorkStatus')],
  ['BagStatus enum', schema.includes('enum BagStatus')],
  ['MovementType enum', schema.includes('enum MovementType')],
  ['IssueStatus enum', schema.includes('enum IssueStatus')],
  ['WashLoadStatus enum', schema.includes('enum WashLoadStatus')],
  ['WashLoadFitStatus enum', schema.includes('enum WashLoadFitStatus')],
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
  ['resort list service exported', typeof resortsService.listResorts === 'function'],
  ['resort create service exported', typeof resortsService.createResort === 'function'],
  ['resort update service exported', typeof resortsService.updateResort === 'function'],
  ['resort name rule exported', typeof resortsBusiness.assertResortName === 'function'],
  ['resort deactivation rule exported', typeof resortsBusiness.assertResortCanBeDeactivated === 'function'],
  ['resort repository active work count exported', typeof resortsRepository.countActiveWorksByResort === 'function'],
  ['laundry work business initial status rule exported', typeof laundryWorksBusiness.assertInitialWorkStatus === 'function'],
  ['laundry work business transition rule exported', typeof laundryWorksBusiness.assertWorkStatusTransition === 'function'],
  ['laundry work business create data builder exported', typeof laundryWorksBusiness.buildCreateWorkData === 'function'],
  ['laundry work business repository resort lookup exported', typeof laundryWorksBusinessRepository.findResortById === 'function'],
  ['laundry work business repository workNo lookup exported', typeof laundryWorksBusinessRepository.findLaundryWorkByWorkNo === 'function'],
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
  ['listLaundryCountLines service exported', typeof laundryCountLinesService.listLaundryCountLines === 'function'],
  ['createLaundryCountLine service exported', typeof laundryCountLinesService.createLaundryCountLine === 'function'],
  ['laundry count line work readiness rule exported', typeof laundryCountLinesBusiness.assertWorkCanAcceptCountLine === 'function'],
  ['laundry count line quantity rule exported', typeof laundryCountLinesBusiness.assertCountQuantities === 'function'],
  ['laundry count line data builder exported', typeof laundryCountLinesBusiness.buildCreateCountLineData === 'function'],
  ['laundry count line repository item type lookup exported', typeof laundryCountLinesRepository.findItemTypeById === 'function'],
  ['listLinenMovements service exported', typeof linenMovementsService.listLinenMovements === 'function'],
  ['createLinenMovement service exported', typeof linenMovementsService.createLinenMovement === 'function'],
  ['linen movement quantity rule exported', typeof linenMovementsBusiness.assertMovementQuantity === 'function'],
  ['linen movement work readiness rule exported', typeof linenMovementsBusiness.assertWorkCanCreateMovement === 'function'],
  ['linen movement data builder exported', typeof linenMovementsBusiness.buildCreateMovementData === 'function'],
  ['linen movement repository item type lookup exported', typeof linenMovementsRepository.findItemTypeById === 'function'],
  ['listIssueReports service exported', typeof issueReportsService.listIssueReports === 'function'],
  ['createIssueReport service exported', typeof issueReportsService.createIssueReport === 'function'],
  ['updateIssueReportStatus service exported', typeof issueReportsService.updateIssueReportStatus === 'function'],
  ['issue report work readiness rule exported', typeof issueReportsBusiness.assertWorkCanReceiveIssue === 'function'],
  ['issue report status update builder exported', typeof issueReportsBusiness.buildIssueStatusUpdateData === 'function'],
  ['issue report repository work lookup exported', typeof issueReportsRepository.findWorkById === 'function'],
  ['listLoadRules service exported', typeof laundryMachineLoadRulesService.listLoadRules === 'function'],
  ['createLoadRule service exported', typeof laundryMachineLoadRulesService.createLoadRule === 'function'],
  ['updateLoadRule service exported', typeof laundryMachineLoadRulesService.updateLoadRule === 'function'],
  ['machine load rule weight rule exported', typeof laundryMachineLoadRulesBusiness.assertLoadRuleWeights === 'function'],
  ['machine load rule create data builder exported', typeof laundryMachineLoadRulesBusiness.buildCreateLoadRuleData === 'function'],
  ['machine load rule repository machine lookup exported', typeof laundryMachineLoadRulesRepository.findMachineById === 'function'],
  ['listWashLoadPlans service exported', typeof washLoadPlansService.listWashLoadPlans === 'function'],
  ['createWashLoadPlan service exported', typeof washLoadPlansService.createWashLoadPlan === 'function'],
  ['updateWashLoadPlanStatus service exported', typeof washLoadPlansService.updateWashLoadPlanStatus === 'function'],
  ['wash load plan readiness rule exported', typeof washLoadPlansBusiness.assertWorkCanReceiveWashLoadPlan === 'function'],
  ['wash load plan fit status calculator exported', typeof washLoadPlansBusiness.calculateFitStatus === 'function'],
  ['wash load plan repository work lookup exported', typeof washLoadPlansRepository.findWorkById === 'function'],
];

const failedChecks = [...schemaChecks, ...be03Checks, ...be05Checks].filter(([, passed]) => !passed);

if (failedChecks.length > 0) {
  const labels = failedChecks.map(([label]) => label).join(', ');
  throw new Error(`Runtime verification failed: ${labels}`);
}

console.log('Backend runtime verification loaded successfully.');
console.log('BE-03 REST API layer verification loaded successfully.');
console.log('BE-05 business layer verification loaded successfully for all required domains.');
