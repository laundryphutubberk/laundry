const { prisma } = require('../core/prisma');

const getClient = (client) => client || prisma;

const issueInclude = {
  itemType: {
    select: {
      id: true,
      name: true,
      category: true,
    },
  },
  reportedBy: {
    select: {
      id: true,
      displayName: true,
      role: true,
    },
  },
};

const listLaundryIssues = async ({ where, client } = {}) => {
  const db = getClient(client);
  return db.issueReport.findMany({
    where,
    include: issueInclude,
    orderBy: {
      reportedAt: 'desc',
    },
  });
};

const findLaundryIssueById = async ({ issueId, where, client } = {}) => {
  const db = getClient(client);
  return db.issueReport.findFirst({
    where: {
      ...where,
      id: Number(issueId),
    },
    include: issueInclude,
  });
};

const createLaundryIssue = async ({ data, client } = {}) => {
  const db = getClient(client);
  return db.issueReport.create({
    data,
    include: issueInclude,
  });
};

const updateLaundryIssue = async ({ issueId, where, data, client } = {}) => {
  const db = getClient(client);
  const result = await db.issueReport.updateMany({
    where: {
      ...where,
      id: Number(issueId),
    },
    data,
  });

  if (!result.count) return null;
  return findLaundryIssueById({ issueId, where, client: db });
};

const updateWorkIssueCount = async ({ workId, resortId, client } = {}) => {
  const db = getClient(client);
  const issueCount = await db.issueReport.count({
    where: {
      workId: Number(workId),
      resortId: Number(resortId),
      status: {
        not: 'CANCELLED',
      },
    },
  });

  await db.laundryWork.updateMany({
    where: {
      id: Number(workId),
      resortId: Number(resortId),
    },
    data: {
      issueCount,
    },
  });

  return issueCount;
};

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  listLaundryIssues,
  findLaundryIssueById,
  createLaundryIssue,
  updateLaundryIssue,
  updateWorkIssueCount,
  transaction,
};
