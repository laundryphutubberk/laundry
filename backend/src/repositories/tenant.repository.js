const { prisma } = require('../core/prisma');

const db = (client) => client || prisma;

const tenantContextSelect = {
  id: true,
  slug: true,
  displayName: true,
  timezone: true,
  status: true,
  laundryWorkspace: {
    select: { id: true, tenantId: true, status: true, displayName: true },
  },
};

const findTenantById = ({ tenantId, client } = {}) => db(client).tenant.findUnique({
  where: { id: tenantId },
  select: tenantContextSelect,
});

const findTenantBySlug = ({ slug, client } = {}) => db(client).tenant.findUnique({
  where: { slug },
  select: tenantContextSelect,
});

const findBranchInTenant = ({ tenantId, branchId, client } = {}) => db(client).branch.findFirst({
  where: { id: branchId, tenantId },
  select: { id: true, tenantId: true, laundryWorkspaceId: true, code: true, name: true, timezone: true, isDefault: true, status: true },
});

const findDefaultBranch = ({ tenantId, client } = {}) => db(client).branch.findFirst({
  where: { tenantId, isDefault: true },
  select: { id: true, tenantId: true, laundryWorkspaceId: true, code: true, name: true, timezone: true, isDefault: true, status: true },
});

module.exports = { findBranchInTenant, findDefaultBranch, findTenantById, findTenantBySlug };
