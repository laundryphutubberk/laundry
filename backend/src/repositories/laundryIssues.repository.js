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

const getIssueLink = async ({ issueId, client } = {}) => {
  const db = getClient(client);
  const rows = await db.$queryRaw`
    SELECT "id", "bagId", "countLineId"
    FROM "IssueReport"
    WHERE "id" = ${Number(issueId)}
    LIMIT 1
  `;
  const row = rows[0];
  return row ? {
    bagId: row.bagId,
    countLineId: row.countLineId,
  } : {};
};

const attachIssueLinks = async (issues, client) => {
  const items = Array.isArray(issues) ? issues : [issues];
  const mapped = await Promise.all(items.map(async (issue) => ({
    ...issue,
    ...(await getIssueLink({ issueId: issue.id, client })),
  })));
  return Array.isArray(issues) ? mapped : mapped[0];
};

const listLaundryIssues = async ({ where, client } = {}) => {
  const db = getClient(client);
  const issues = await db.issueReport.findMany({
    where,
    include: issueInclude,
    orderBy: {
      reportedAt: 'desc',
    },
  });
  return attachIssueLinks(issues, db);
};

const findLaundryIssueById = async ({ issueId, where, client } = {}) => {
  const db = getClient(client);
  const issue = await db.issueReport.findFirst({
    where: {
      ...where,
      id: Number(issueId),
    },
    include: issueInclude,
  });
  return issue ? attachIssueLinks(issue, db) : null;
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

const updateLaundryIssueLinks = async ({ issueId, bagId, countLineId, client } = {}) => {
  const db = getClient(client);
  await db.$executeRaw`
    UPDATE "IssueReport"
    SET "bagId" = ${bagId === undefined ? null : bagId},
        "countLineId" = ${countLineId === undefined ? null : countLineId},
        "updatedAt" = NOW()
    WHERE "id" = ${Number(issueId)}
  `;
};

const findScopedBag = async ({ bagId, workId, resortId, client } = {}) => {
  if (!bagId) return null;
  const db = getClient(client);
  return db.laundryBag.findFirst({
    where: {
      id: Number(bagId),
      workId: Number(workId),
      resortId: Number(resortId),
    },
  });
};

const findScopedCountLine = async ({ countLineId, workId, resortId, client } = {}) => {
  if (!countLineId) return null;
  const db = getClient(client);
  return db.laundryCountLine.findFirst({
    where: {
      id: Number(countLineId),
      workId: Number(workId),
      resortId: Number(resortId),
    },
  });
};

const updateWorkIssueCount = async ({ workId, resortId, client } = {}) => {
  const db = getClient(client);
  const issueCount = await db.issueReport.count({
    where: {
      workId: Number(workId),
      resortId: Number(resortId),
      status: {
        in: ['OPEN', 'REVIEWING'],
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
  updateLaundryIssueLinks,
  findScopedBag,
  findScopedCountLine,
  updateWorkIssueCount,
  transaction,
};
