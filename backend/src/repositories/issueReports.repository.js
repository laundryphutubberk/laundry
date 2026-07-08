const { prisma } = require('../core/prisma');

const getClient = (client) => client || prisma;

const findAccessibleWork = async ({ workId, where, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.findFirst({
    where: {
      id: Number(workId),
      ...(where && where.resortId ? { resortId: where.resortId } : {}),
    },
  });
};

const findIssueById = async ({ issueId, where, client } = {}) => {
  const db = getClient(client);

  return db.issueReport.findFirst({
    where: {
      ...where,
      id: Number(issueId),
    },
  });
};

const findItemTypeById = async ({ itemTypeId, client } = {}) => {
  if (!itemTypeId) {
    return null;
  }

  const db = getClient(client);

  return db.laundryItemType.findUnique({
    where: {
      id: Number(itemTypeId),
    },
  });
};

const listIssueReports = async ({ where, skip, take, client } = {}) => {
  const db = getClient(client);

  const [items, total] = await Promise.all([
    db.issueReport.findMany({
      where,
      orderBy: {
        reportedAt: 'desc',
      },
      skip,
      take,
      include: {
        work: true,
        itemType: true,
        reportedBy: true,
      },
    }),
    db.issueReport.count({ where }),
  ]);

  return {
    items,
    total,
  };
};

const createIssueReport = async ({ data, client } = {}) => {
  const db = getClient(client);

  return db.issueReport.create({
    data,
    include: {
      work: true,
      itemType: true,
      reportedBy: true,
    },
  });
};

const updateIssueReportStatus = async ({ issueId, data, client } = {}) => {
  const db = getClient(client);

  return db.issueReport.update({
    where: {
      id: Number(issueId),
    },
    data,
    include: {
      work: true,
      itemType: true,
      reportedBy: true,
    },
  });
};

const incrementWorkIssueCount = async ({ workId, client } = {}) => {
  const db = getClient(client);

  return db.laundryWork.update({
    where: {
      id: Number(workId),
    },
    data: {
      issueCount: {
        increment: 1,
      },
    },
  });
};

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  findAccessibleWork,
  findIssueById,
  findItemTypeById,
  listIssueReports,
  createIssueReport,
  updateIssueReportStatus,
  incrementWorkIssueCount,
  transaction,
};
