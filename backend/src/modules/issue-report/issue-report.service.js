const issueReportsBusiness = require('./issue-report.business');
const issueReportsRepository = require('./issue-report.repository');
const { assertLaundryStaffActor } = require('../../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../../policies/workspace.policy');
const { normalizePagination } = require('../../shared/pagination');

const buildIssueReportWhere = ({ actor, status } = {}) => {
  const where = buildRequiredActorResortScopedWhere({ actor });

  if (status) {
    where.status = status;
  }

  return where;
};

const listIssueReports = async (query = {}, context = {}) => {
  const { skip, take } = normalizePagination(query);

  const where = buildIssueReportWhere({
    actor: context.actor,
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

const createIssueReport = async (workId, payload = {}, context = {}) => {
  assertLaundryStaffActor(context.actor);

  return issueReportsRepository.transaction(async (tx) => {
    const where = buildRequiredActorResortScopedWhere({ actor: context.actor });

    const work = await issueReportsRepository.findAccessibleWork({
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

const updateIssueReportStatus = async (issueId, payload = {}, context = {}) => {
  assertLaundryStaffActor(context.actor);

  return issueReportsRepository.transaction(async (tx) => {
    const where = buildRequiredActorResortScopedWhere({ actor: context.actor });

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
