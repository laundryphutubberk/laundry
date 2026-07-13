const { prisma } = require('../core/prisma');

const publicIdentitySelect = {
  id: true,
  userId: true,
  provider: true,
  providerSubject: true,
  providerEmail: true,
  emailVerified: true,
  displayName: true,
  avatarUrl: true,
  linkedAt: true,
  lastUsedAt: true,
  unlinkedAt: true,
  createdAt: true,
  updatedAt: true,
};

const findByProviderSubject = (provider, providerSubject) => prisma.userIdentity.findUnique({
  where: { provider_providerSubject: { provider, providerSubject } },
  select: publicIdentitySelect,
});

const findActiveByProviderSubject = (provider, providerSubject) => prisma.userIdentity.findFirst({
  where: { provider, providerSubject, unlinkedAt: null },
  select: publicIdentitySelect,
});

const listForUser = (userId) => prisma.userIdentity.findMany({
  where: { userId },
  orderBy: { linkedAt: 'asc' },
  select: publicIdentitySelect,
});

const findUserByVerifiedEmail = (email) => prisma.user.findUnique({
  where: { email: email.toLowerCase() },
  select: { id: true, email: true, role: true, workspaceType: true, resortId: true, active: true },
});

const createIdentity = (data) => prisma.userIdentity.create({ data, select: publicIdentitySelect });

const updateSnapshots = (id, data) => prisma.userIdentity.update({
  where: { id },
  data,
  select: publicIdentitySelect,
});

const markUnlinked = (id, unlinkedAt = new Date()) => prisma.userIdentity.update({
  where: { id },
  data: { unlinkedAt },
  select: publicIdentitySelect,
});

const getUsableMethodCounts = async (userId, excludedIdentityId) => {
  const [user, activeIdentityCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } }),
    prisma.userIdentity.count({ where: { userId, unlinkedAt: null, id: { not: excludedIdentityId } } }),
  ]);
  return { hasPassword: Boolean(user?.passwordHash), activeIdentityCount };
};

module.exports = {
  createIdentity,
  findActiveByProviderSubject,
  findByProviderSubject,
  findUserByVerifiedEmail,
  getUsableMethodCounts,
  listForUser,
  markUnlinked,
  updateSnapshots,
};
