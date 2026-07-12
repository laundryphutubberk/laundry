const { prisma } = require('../core/prisma');

const userSelect = {
  id: true,
  email: true,
  passwordHash: true,
  displayName: true,
  role: true,
  workspaceType: true,
  resortId: true,
  active: true,
};

const findActiveUserByEmail = async (email) => {
  return prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      active: true,
    },
    select: userSelect,
  });
};

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
    select: userSelect,
  });
};

const createUser = async ({ email, passwordHash, displayName, role, workspaceType, resortId }) => {
  return prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      displayName,
      role,
      workspaceType,
      resortId: resortId || null,
      active: true,
    },
    select: userSelect,
  });
};

const createDeviceSession = (data) => prisma.deviceSession.create({ data });

const findDeviceSessionById = (id) => prisma.deviceSession.findUnique({
  where: { id },
  include: { user: { select: userSelect } },
});

const rotateDeviceSession = (id, expectedHash, data) => prisma.deviceSession.updateMany({
  where: { id, credentialHash: expectedHash, revokedAt: null },
  data,
});

const revokeDeviceSession = (id, revokedAt = new Date()) => prisma.deviceSession.updateMany({
  where: { id, revokedAt: null },
  data: { revokedAt },
});

const revokeAllDeviceSessions = (userId, revokedAt = new Date()) => prisma.deviceSession.updateMany({
  where: { userId, revokedAt: null },
  data: { revokedAt },
});

const revokeSessionFamily = (familyId, data) => prisma.deviceSession.updateMany({
  where: { familyId, revokedAt: null },
  data,
});

const listDeviceSessions = (userId) => prisma.deviceSession.findMany({
  where: { userId },
  orderBy: { lastUsedAt: 'desc' },
  select: {
    id: true,
    deviceLabel: true,
    createdAt: true,
    lastUsedAt: true,
    idleExpiresAt: true,
    absoluteExpiresAt: true,
    revokedAt: true,
  },
});

const findOwnedDeviceSession = (id, userId) => prisma.deviceSession.findFirst({
  where: { id, userId },
  select: { id: true, userId: true, revokedAt: true },
});

module.exports = {
  findActiveUserByEmail,
  findUserByEmail,
  createUser,
  createDeviceSession,
  findDeviceSessionById,
  rotateDeviceSession,
  revokeDeviceSession,
  revokeAllDeviceSessions,
  revokeSessionFamily,
  listDeviceSessions,
  findOwnedDeviceSession,
};
