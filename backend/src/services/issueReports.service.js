const issueReportsBusiness = require('../domain/issueReports.business');
const issueReportsRepository = require('../repositories/issueReports.repository');
const { normalizePagination } = require('../shared/pagination');

const listIssueReports = async (query = {}) => {
  const { skip, take } = normalizePagination(query);

  const where = issueReportsRepository.buildWorkspaceWhere({
    workspaceType: query.workspaceType,
    resortId: query.resortId,
    status: query.status,
  });

  if (query.workId) {
    where.workId = Number(query.workId);
  }

  const result = await issueReportsRepository.listIssueReports({
    where,
    skip,
    take,
  });

  return {
    items: result.items,
    pagination: {
      total: result.total,
      skip,
      take,
    },
  };
};

const createIssueReport = async (workId, payload = {}, query = {}) => {
  return issueReportsRepository.transaction(async (tx) => {
    const where = issueReportsRepository.buildWorkspaceWhere({
      workspaceType: query.workspaceType,
      resortId: query.resortId,
    });

    const work = await issueReportsRepository.findWorkById({
      workId,
      where,
      client: tx,
    });
    issueReportsBusiness.assertWorkCanReceiveIssue(work);

    const itemType = await issueReportsRepository.findItemTypeById({
      itemTypeId: payload.itemTypeId,
      client: tx,
    });
    issueReportsBusiness.assertOptionalItemTypeCanBeUsed(itemType);

    const issue = await issueReportsRepository.createIssueReport({
      data: issueReportsBusiness.buildCreateIssueReportData({ work, payload }),
      client: tx,
    });

    if (issueReportsBusiness.shouldIncrementWorkIssueCount(issue.status)) {
      await issueReportsRepository.incrementWorkIssueCount({
        workId: work.id,
        client: tx,
      });
    }

    return issue;
  });
};

const updateIssueReportStatus = async (issueId, payload = {}, query = {}) => {
  return issueReportsRepository.transaction(async (tx) => {
    const where = issueReportsRepository.buildWorkspaceWhere({
      workspaceType: query.workspaceType,
      resortId: query.resortId,
    });

    const issue = await issueReportsRepository.findIssueById({
      issueId,
      where,
      client: tx,
    });

    return issueReportsRepository.updateIssueReportStatus({
      issueId,
      data: issueReportsBusiness.buildIssueStatusUpdateData({ issue, payload }),
      client: tx,
    });
  });
};

module.exports = {
  listIssueReports,
  createIssueReport,
  updateIssueReportStatus,
};
