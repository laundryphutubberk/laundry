const tenantRepository = require('../repositories/tenant.repository');
const membershipRepository = require('../repositories/tenantMembership.repository');
const { assertActiveTenantContext } = require('../policies/tenantMembership.policy');

const createTenantContextService = ({ tenants = tenantRepository, memberships = membershipRepository } = {}) => ({
  async resolve({ userId, tenantId, branchId } = {}) {
    const [tenant, membership] = await Promise.all([
      tenants.findTenantById({ tenantId }),
      memberships.findMembership({ tenantId, userId }),
    ]);
    const workspace = tenant?.laundryWorkspace || null;
    const branch = branchId
      ? await tenants.findBranchInTenant({ tenantId, branchId })
      : await tenants.findDefaultBranch({ tenantId });
    return assertActiveTenantContext({ tenant, membership, workspace, branch });
  },

  listActiveForUser(userId) {
    return memberships.listActiveMembershipsForUser({ userId });
  },
});

module.exports = { createTenantContextService };
