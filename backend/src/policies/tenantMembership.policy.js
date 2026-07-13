const fail = (code, message, statusCode = 403) => Object.assign(new Error(message), { code, statusCode });

const assertActiveTenantContext = ({ tenant, membership, workspace, branch } = {}) => {
  if (!tenant) throw fail('TENANT_NOT_FOUND', 'Tenant context was not found', 404);
  if (tenant.status !== 'ACTIVE') throw fail('TENANT_NOT_ACTIVE', 'Tenant is not active');
  if (!workspace || workspace.tenantId !== tenant.id) throw fail('LAUNDRY_WORKSPACE_NOT_FOUND', 'Laundry Workspace was not found', 404);
  if (workspace.status !== 'ACTIVE') throw fail('LAUNDRY_WORKSPACE_NOT_ACTIVE', 'Laundry Workspace is not active');
  if (!membership || membership.tenantId !== tenant.id) throw fail('TENANT_MEMBERSHIP_REQUIRED', 'Active Tenant Membership is required');
  if (membership.status !== 'ACTIVE') throw fail('TENANT_MEMBERSHIP_INACTIVE', 'Tenant Membership is not active');
  if (branch) {
    if (branch.tenantId !== tenant.id || branch.laundryWorkspaceId !== workspace.id) throw fail('TENANT_SCOPE_MISMATCH', 'Branch does not belong to the Tenant context', 404);
    if (branch.status !== 'ACTIVE') throw fail('BRANCH_NOT_ACTIVE', 'Branch is not active');
  }
  return { tenant, workspace, membership, branch: branch || null };
};

module.exports = { assertActiveTenantContext };
