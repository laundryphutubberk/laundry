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

module.exports = {
  findActiveUserByEmail,
  findUserByEmail,
  createUser,
};
