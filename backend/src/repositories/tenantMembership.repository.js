const { prisma } = require('../core/prisma');

const db = (client) => client || prisma;
const membershipSelect = {
  id: true,
  tenantId: true,
  userId: true,
  role: true,
  status: true,
  version: true,
  positionTitle: true,
  activatedAt: true,
  suspendedAt: true,
  revokedAt: true,
};

const findMembership = ({ tenantId, userId, client } = {}) => db(client).tenantMembership.findUnique({
  where: { tenantId_userId: { tenantId, userId } },
  select: membershipSelect,
});

const listActiveMembershipsForUser = ({ userId, client } = {}) => db(client).tenantMembership.findMany({
  where: { userId, status: 'ACTIVE', tenant: { status: 'ACTIVE' } },
  orderBy: { createdAt: 'asc' },
  select: membershipSelect,
});

module.exports = { findMembership, listActiveMembershipsForUser };
