const { prisma } = require('../src/core/prisma');
const { createTenantContextService } = require('../src/services/tenantContext.service');
const { assertActiveTenantContext } = require('../src/policies/tenantMembership.policy');

const PILOT_ID = '00000000-0000-4000-8000-000000000101';
const fail = (message) => { throw new Error(message); };

async function run() {
  const pilot = await prisma.tenant.findUnique({ where: { slug: 'laundry-pilot' }, include: { laundryWorkspace: true, branches: true, memberships: true } });
  if (!pilot || pilot.id !== PILOT_ID || pilot.displayName !== 'Laundry Pilot' || pilot.legalName !== null || pilot.timezone !== 'Asia/Bangkok' || pilot.status !== 'ACTIVE') fail('Pilot Tenant backfill is invalid');
  if (pilot.laundryWorkspace?.status !== 'ACTIVE') fail('Pilot LaundryWorkspace is invalid');
  const main = pilot.branches.find((branch) => branch.code === 'MAIN');
  if (!main || main.name !== 'สำนักงานใหญ่' || main.timezone !== 'Asia/Bangkok' || !main.isDefault || main.status !== 'ACTIVE') fail('Pilot Branch is invalid');
  if (!pilot.memberships.some((membership) => membership.role === 'OWNER' && membership.status === 'ACTIVE')) fail('Pilot Tenant has no active OWNER');

  const eligibleLaundryUsers = await prisma.user.findMany({
    where: { active: true, workspaceType: 'LAUNDRY', onboardingStatus: { not: 'PENDING' } },
    orderBy: { id: 'asc' },
    select: { id: true, role: true },
  });
  const activeOwners = pilot.memberships.filter((membership) => membership.role === 'OWNER' && membership.status === 'ACTIVE');
  if (activeOwners.length !== 1) fail('Development bootstrap must produce exactly one active OWNER when the database began without one');
  if (activeOwners[0].userId !== eligibleLaundryUsers[0]?.id || eligibleLaundryUsers[0]?.role !== 'LAUNDRY_OWNER') fail('Development bootstrap did not select the lowest eligible userId');
  console.log(`TENANT_MEMBERSHIP_BOOTSTRAP_OWNER_USER_ID=${activeOwners[0].userId}`);

  const users = await prisma.user.findMany({ select: { id: true, active: true, role: true, workspaceType: true, onboardingStatus: true, tenantMemberships: { where: { tenantId: PILOT_ID } } } });
  const mapping = { LAUNDRY_OWNER: 'OWNER', LAUNDRY_MANAGER: 'MANAGER', LAUNDRY_STAFF: 'STAFF' };
  for (const user of users) {
    const eligible = user.active && user.workspaceType === 'LAUNDRY' && user.onboardingStatus !== 'PENDING' && Boolean(mapping[user.role]);
    if (eligible) {
      if (user.tenantMemberships.length !== 1 || user.tenantMemberships[0].role !== mapping[user.role] || user.tenantMemberships[0].status !== 'ACTIVE') fail(`Eligible User ${user.id} membership mismatch`);
    }
  }

  const owner = pilot.memberships.find((membership) => membership.role === 'OWNER' && membership.status === 'ACTIVE');
  const resolved = await createTenantContextService().resolve({ userId: owner.userId, tenantId: PILOT_ID });
  if (resolved.tenant.id !== PILOT_ID || resolved.branch.id !== main.id || resolved.membership.id !== owner.id) fail('Tenant context resolution failed');

  let crossScope;
  try { assertActiveTenantContext({ ...resolved, branch: { ...resolved.branch, tenantId: 'other' } }); } catch (error) { crossScope = error; }
  if (crossScope?.code !== 'TENANT_SCOPE_MISMATCH') fail('Cross-Tenant Branch was not rejected');
  let suspended;
  try { assertActiveTenantContext({ ...resolved, tenant: { ...resolved.tenant, status: 'SUSPENDED' } }); } catch (error) { suspended = error; }
  if (suspended?.code !== 'TENANT_NOT_ACTIVE') fail('Suspended Tenant did not fail closed');

  const marker = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const tenantA = await prisma.tenant.create({ data: { slug: `verify-a-${marker}`, displayName: 'Verify A', timezone: 'Asia/Bangkok', status: 'ACTIVE', laundryWorkspace: { create: { status: 'ACTIVE' } } }, include: { laundryWorkspace: true } });
  const tenantB = await prisma.tenant.create({ data: { slug: `verify-b-${marker}`, displayName: 'Verify B', timezone: 'Asia/Bangkok', status: 'ACTIVE', laundryWorkspace: { create: { status: 'ACTIVE' } } }, include: { laundryWorkspace: true } });
  try {
    await prisma.branch.create({ data: { tenantId: tenantA.id, laundryWorkspaceId: tenantA.laundryWorkspace.id, code: 'MAIN', name: 'A', isDefault: true, status: 'ACTIVE' } });
    let secondDefault;
    try { await prisma.branch.create({ data: { tenantId: tenantA.id, laundryWorkspaceId: tenantA.laundryWorkspace.id, code: 'SECOND', name: 'A2', isDefault: true, status: 'ACTIVE' } }); } catch (error) { secondDefault = error; }
    if (secondDefault?.code !== 'P2002') fail('One-default-Branch database constraint failed');
    let mismatchedWorkspace;
    try { await prisma.branch.create({ data: { tenantId: tenantA.id, laundryWorkspaceId: tenantB.laundryWorkspace.id, code: 'WRONG', name: 'Wrong', status: 'ACTIVE' } }); } catch (error) { mismatchedWorkspace = error; }
    if (mismatchedWorkspace?.code !== 'P2003') fail('Tenant/Workspace ownership database constraint failed');
  } finally {
    await prisma.tenant.deleteMany({ where: { id: { in: [tenantA.id, tenantB.id] } } });
  }

  console.log('TENANT_MEMBERSHIP_FOUNDATION_VERIFY=PASS');
}

run().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
