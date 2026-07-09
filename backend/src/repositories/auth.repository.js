const { prisma } = require('../core/prisma');

const findActiveUserByEmail = async (email) => {
  return prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      active: true,
    },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      displayName: true,
      role: true,
      workspaceType: true,
      resortId: true,
      active: true,
    },
  });
};

module.exports = {
  findActiveUserByEmail,
};
