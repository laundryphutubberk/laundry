const fs = require('fs');
const path = require('path');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://verify:verify@localhost:5432/laundry_verify';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'verify-runtime-jwt-secret-at-least-32-chars';
process.env.ENABLE_DEV_ACTOR_HEADER = process.env.ENABLE_DEV_ACTOR_HEADER || 'false';

require('../src/config/env');
require('../src/core/prisma');
require('../src/core/runtimeShutdown');
require('../src/app');
require('../src/routes');

const { USER_ROLES, WORKSPACE_TYPES } = require('../src/core/actor');
const requestContext = require('../src/core/requestContext');
const policyContext = require('../src/core/policyContext');
const workspacePolicy = require('../src/policies/workspace.policy');
const authorizationPolicy = require('../src/policies/authorization.policy');
const { authActorMiddleware } = require('../src/middlewares/authActor.middleware');

const laundryWorksRoutes = require('../src/modules/laundry-work');
const laundryWorksService = require('../src/modules/laundry-work/laundry-work.service');
const laundryWorksValidator = require('../src/modules/laundry-work/laundry-work.validation');
const laundryWorksBusiness = require('../src/modules/laundry-work/laundry-work.business');
const laundryWorksRepository = require('../src/modules/laundry-work/laundry-work.repository');
const laundryWorksControllerPath = path.resolve(__dirname, '../src/modules/laundry-work/laundry-work.controller.js');

const laundryBagsRoutes = require('../src/modules/laundry-bag');
const laundryBagsService = require('../src/modules/laundry-bag/laundry-bag.service');
const laundryBagsValidator = require('../src/modules/laundry-bag/laundry-bag.validation');
const laundryBagsBusiness = require('../src/modules/laundry-bag/laundry-bag.business');
const laundryBagsRepository = require('../src/modules/laundry-bag/laundry-bag.repository');
const laundryBagsControllerPath = path.resolve(__dirname, '../src/modules/laundry-bag/laundry-bag.controller.js');

const laundryCountLinesService = require('../src/modules/laundry-count-line/laundry-count-line.service');
const laundryCountLinesBusiness = require('../src/modules/laundry-count-line/laundry-count-line.business');
const laundryCountLinesRepository = require('../src/modules/laundry-count-line/laundry-count-line.repository');

const linenMovementsService = require('../src/modules/linen-movement/linen-movement.service');
const linenMovementsBusiness = require('../src/modules/linen-movement/linen-movement.business');
const linenMovementsRepository = require('../src/modules/linen-movement/linen-movement.repository');

const issueReportsService = require('../src/modules/issue-report/issue-report.service');
const issueReportsBusiness = require('../src/modules/issue-report/issue-report.business');
const issueReportsRepository = require('../src/modules/issue-report/issue-report.repository');

const laundryMachineLoadRulesService = require('../src/modules/laundry-machine-load-rule/laundry-machine-load-rule.service');
const laundryMachineLoadRulesBusiness = require('../src/modules/laundry-machine-load-rule/laundry-machine-load-rule.business');
const laundryMachineLoadRulesRepository = require('../src/modules/laundry-machine-load-rule/laundry-machine-load-rule.repository');

const washLoadPlansService = require('../src/modules/wash-load-plan/wash-load-plan.service');
const washLoadPlansBusiness = require('../src/modules/wash-load-plan/wash-load-plan.business');
const washLoadPlansRepository = require('../src/modules/wash-load-plan/wash-load-plan.repository');

const resortsService = require('../src/modules/resort/resort.service');
const resortsBusiness = require('../src/modules/resort/resort.business');
const resortsRepository = require('../src/modules/resort/resort.repository');

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
const schema = fs.readFileSync(schemaPath, 'utf8');
const routesIndex = fs.readFileSync(path.resolve(__dirname, '../src/routes/index.js'), 'utf8');
const laundryWorksControllerSource = fs.readFileSync(laundryWorksControllerPath, 'utf8');
const laundryBagsControllerSource = fs.readFileSync(laundryBagsControllerPath, 'utf8');

const readSource = (relativePath) => fs.readFileSync(path.resolve(__dirname, '..', relativePath), 'utf8');

const serviceSources = [
  ['laundry-work service', 'src/modules/laundry-work/laundry-work.service.js'],
  ['laundry-bag service', 'src/modules/laundry-bag/laundry-bag.service.js'],
  ['laundry-count-line service', 'src/modules/laundry-count-line/laundry-count-line.service.js'],
  ['linen-movement service', 'src/modules/linen-movement/linen-movement.service.js'],
  ['issue-report service', 'src/modules/issue-report/issue-report.service.js'],
  ['wash-load-plan service', 'src/modules/wash-load-plan/wash-load-plan.service.js'],
];

const masterDataServiceSources = [
  ['laundry-machine-load-rule service', 'src/modules/laundry-machine-load-rule/laundry-machine-load-rule.service.js'],
  ['resort service', 'src/modules/resort/resort.service.js'],
];

const repositorySources = [
  ['laundry-work repository', 'src/modules/laundry-work/laundry-work.repository.js'],
  ['laundry-bag repository', 'src/modules/laundry-bag/laundry-bag.repository.js'],
  ['laundry-count-line repository', 'src/modules/laundry-count-line/laundry-count-line.repository.js'],
  ['linen-movement repository', 'src/modules/linen-movement/linen-movement.repository.js'],
  ['issue-report repository', 'src/modules/issue-report/issue-report.repository.js'],
  ['wash-load-plan repository', 'src/modules/wash-load-plan/wash-load-plan.repository.js'],
];

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
];

const exportChecks = [
  ['actor roles exported', USER_ROLES.LAUNDRY_STAFF === 'LAUNDRY_STAFF'],
  ['workspace types exported', WORKSPACE_TYPES.RESORT === 'RESORT'],
  ['request actor setter exported', typeof requestContext.setRequestActor === 'function'],
  ['request actor getter exported', typeof requestContext.getRequestActor === 'function'],
  ['policy context helper exported', typeof policyContext.getRequestPolicyContext === 'function'],
  ['workspace policy actor scope exported', typeof workspacePolicy.buildRequiredActorResortScopedWhere === 'function'],
  ['authorization staff gate exported', typeof authorizationPolicy.assertLaundryStaffActor === 'function'],
  ['authorization management gate exported', typeof authorizationPolicy.assertLaundryManagementActor === 'function'],
  ['auth actor middleware exported', typeof authActorMiddleware === 'function'],
  ['laundry works router loaded', typeof laundryWorksRoutes === 'function'],
  ['laundry bags router loaded', typeof laundryBagsRoutes === 'function'],
  ['listLaundryWorks service exported', typeof laundryWorksService.listLaundryWorks === 'function'],
  ['getLaundryWorkById service exported', typeof laundryWorksService.getLaundryWorkById === 'function'],
  ['createLaundryWork service exported', typeof laundryWorksService.createLaundryWork === 'function'],
  ['updateLaundryWorkStatus service exported', typeof laundryWorksService.updateLaundryWorkStatus === 'function'],
  ['laundry work validator parseRequest exported', typeof laundryWorksValidator.parseRequest === 'function'],
  ['listLaundryBags service exported', typeof laundryBagsService.listLaundryBags === 'function'],
  ['getLaundryBagById service exported', typeof laundryBagsService.getLaundryBagById === 'function'],
  ['createLaundryBag service exported', typeof laundryBagsService.createLaundryBag === 'function'],
  ['updateLaundryBagStatus service exported', typeof laundryBagsService.updateLaundryBagStatus === 'function'],
  ['laundry bag validator parseRequest exported', typeof laundryBagsValidator.parseRequest === 'function'],
  ['listLaundryCountLines service exported', typeof laundryCountLinesService.listLaundryCountLines === 'function'],
  ['createLaundryCountLine service exported', typeof laundryCountLinesService.createLaundryCountLine === 'function'],
  ['listLinenMovements service exported', typeof linenMovementsService.listLinenMovements === 'function'],
  ['createLinenMovement service exported', typeof linenMovementsService.createLinenMovement === 'function'],
  ['listIssueReports service exported', typeof issueReportsService.listIssueReports === 'function'],
  ['createIssueReport service exported', typeof issueReportsService.createIssueReport === 'function'],
  ['updateIssueReportStatus service exported', typeof issueReportsService.updateIssueReportStatus === 'function'],
  ['listLoadRules service exported', typeof laundryMachineLoadRulesService.listLoadRules === 'function'],
  ['createLoadRule service exported', typeof laundryMachineLoadRulesService.createLoadRule === 'function'],
  ['updateLoadRule service exported', typeof laundryMachineLoadRulesService.updateLoadRule === 'function'],
  ['listWashLoadPlans service exported', typeof washLoadPlansService.listWashLoadPlans === 'function'],
  ['createWashLoadPlan service exported', typeof washLoadPlansService.createWashLoadPlan === 'function'],
  ['updateWashLoadPlanStatus service exported', typeof washLoadPlansService.updateWashLoadPlanStatus === 'function'],
  ['resort list service exported', typeof resortsService.listResorts === 'function'],
  ['resort create service exported', typeof resortsService.createResort === 'function'],
  ['resort update service exported', typeof resortsService.updateResort === 'function'],
  ['laundry work business transition rule exported', typeof laundryWorksBusiness.assertWorkStatusTransition === 'function'],
  ['laundry bag business receive rule exported', typeof laundryBagsBusiness.assertWorkCanReceiveBag === 'function'],
  ['laundry count line business rule exported', typeof laundryCountLinesBusiness.assertWorkCanAcceptCountLine === 'function'],
  ['linen movement business rule exported', typeof linenMovementsBusiness.assertWorkCanCreateMovement === 'function'],
  ['issue report business rule exported', typeof issueReportsBusiness.assertWorkCanReceiveIssue === 'function'],
  ['load rule business data builder exported', typeof laundryMachineLoadRulesBusiness.buildCreateLoadRuleData === 'function'],
  ['wash load plan business rule exported', typeof washLoadPlansBusiness.assertWorkCanReceiveWashLoadPlan === 'function'],
  ['resort business deactivation rule exported', typeof resortsBusiness.assertResortCanBeDeactivated === 'function'],
  ['laundry work repository scoped lookup exported', typeof laundryWorksRepository.findLaundryWorkByIdForUpdate === 'function'],
  ['laundry bag repository scoped work lookup exported', typeof laundryBagsRepository.findAccessibleWork === 'function'],
  ['count line repository scoped work lookup exported', typeof laundryCountLinesRepository.findAccessibleWork === 'function'],
  ['linen movement repository scoped work lookup exported', typeof linenMovementsRepository.findAccessibleWork === 'function'],
  ['issue report repository scoped work lookup exported', typeof issueReportsRepository.findAccessibleWork === 'function'],
  ['wash load plan repository scoped work lookup exported', typeof washLoadPlansRepository.findAccessibleWork === 'function'],
  ['resort repository active work count exported', typeof resortsRepository.countActiveWorksByResort === 'function'],
];

const routePolicyChecks = [
  ['nested bags route mounted before work parent route', routesIndex.indexOf('/laundry/works/:workId/bags') < routesIndex.indexOf('/laundry/works', routesIndex.indexOf('/laundry/works/:workId/bags') + 1)],
  ['bags route protected by auth middleware', routesIndex.includes("router.use('/laundry/works/:workId/bags', authActorMiddleware")],
  ['works route protected by auth middleware', routesIndex.includes("router.use('/laundry/works', authActorMiddleware")],
  ['work controller uses policy context helper', laundryWorksControllerSource.includes('getRequestPolicyContext(req)')],
  ['bag controller uses policy context helper', laundryBagsControllerSource.includes('getRequestPolicyContext(req)')],
];

const servicePolicyChecks = serviceSources.flatMap(([label, relativePath]) => {
  const source = readSource(relativePath);
  return [
    [`${label} uses actor workspace policy`, source.includes('buildRequiredActorResortScopedWhere')],
    [`${label} does not use query.workspaceType`, !source.includes('query.workspaceType')],
    [`${label} does not use query.resortId`, !source.includes('query.resortId')],
  ];
});

const staffGateChecks = serviceSources.flatMap(([label, relativePath]) => {
  const source = readSource(relativePath);
  return [[`${label} has staff write gate`, source.includes('assertLaundryStaffActor')]];
});

const masterDataPolicyChecks = masterDataServiceSources.flatMap(([label, relativePath]) => {
  const source = readSource(relativePath);
  return [
    [`${label} has staff read gate`, source.includes('assertLaundryStaffActor')],
    [`${label} has management write gate`, source.includes('assertLaundryManagementActor')],
  ];
});

const repositoryPolicyChecks = repositorySources.flatMap(([label, relativePath]) => {
  const source = readSource(relativePath);
  return [
    [`${label} does not import shared workspace scope`, !source.includes('shared/workspaceScope')],
    [`${label} does not export buildWorkspaceWhere`, !source.includes('buildWorkspaceWhere')],
    [`${label} does not import workspace policy`, !source.includes('workspace.policy')],
    [`${label} does not import authorization policy`, !source.includes('authorization.policy')],
  ];
});

const failedChecks = [
  ...schemaChecks,
  ...exportChecks,
  ...routePolicyChecks,
  ...servicePolicyChecks,
  ...staffGateChecks,
  ...masterDataPolicyChecks,
  ...repositoryPolicyChecks,
].filter(([, passed]) => !passed);

if (failedChecks.length > 0) {
  const labels = failedChecks.map(([label]) => label).join(', ');
  throw new Error(`Runtime verification failed: ${labels}`);
}

console.log('Backend runtime verification loaded successfully.');
console.log('BE-07 feature-first policy architecture verification passed.');
