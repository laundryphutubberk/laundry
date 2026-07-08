const issueReportsBusiness = require('../domain/issueReports.business');
const issueReportsRepository = require('../repositories/issueReports.repository');
const { logger } = require('../core/observability');
const { assertLaundryStaffActor } = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');
const { normalizePagination } = require('../shared/pagination');

const buildIssueReportWhere = ({ actor, status } = {}) => {
  const where = buildRequiredActorResortScopedWhere({ actor });

  if (status) {
    where.status = status;
  }

  return where;
};

const buildActorLogContext = (actor) => ({
  actorId: actor?.id,
  actorRole: actor?.role,
  workspaceType: actor?.workspaceType,
  actorResortId: actor?.resortId,
});

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

  const issue = await issueReportsRepository.transaction(async (tx) => {
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

    const createdIssue = await issueReportsRepository.createIssueReport({
      data: issueReportsBusiness.buildCreateIssueReportData({ work, payload }),
      client: tx,
    });

    if (issueReportsBusiness.shouldIncrementWorkIssueCount(createdIssue.status)) {
      const workUpdateResult = await issueReportsRepository.incrementWorkIssueCount({
        workId: work.id,
        expectedStatus: work.currentStatus,
        client: tx,
      });

      if (workUpdateResult.count === 0) {
        const error = new Error('Laundry Work status changed during issue report creation');
        error.statusCode = 409;
        throw error;
      }
    }

    return createdIssue;
  });

  logger.business('laundry.issue.reported', {
    ...buildActorLogContext(context.actor),
    issueId: issue.id,
    workId: issue.workId,
    resortId: issue.resortId,
    itemTypeId: issue.itemTypeId,
    colorGroup: issue.colorGroup,
    issueType: issue.issueType,
    quantity: issue.quantity,
    status: issue.status,
  });

  return issue;
};

const updateIssueReportStatus = async (issueId, payload = {}, context = {}) => {
  assertLaundryStaffActor(context.actor);

  const result = await issueReportsRepository.transaction(async (tx) => {
    const where = buildRequiredActorResortScopedWhere({ actor: context.actor });

    const issue = await issueReportsRepository.findIssueById({
      issueId,
      where,
      client: tx,
    });

    const updatedIssue = await issueReportsRepository.updateIssueReportStatus({
      issueId,
      expectedStatus: issue.status,
      data: issueReportsBusiness.buildIssueStatusUpdateData({ issue, payload }),
      client: tx,
    });

    if (!updatedIssue) {
      const error = new Error('Issue Report status changed during update');
      error.statusCode = 409;
      throw error;
    }

    return {
      issue,
      updatedIssue,
    };
  });

  logger.business('laundry.issue.status_changed', {
    ...buildActorLogContext(context.actor),
    issueId: result.updatedIssue.id,
    workId: result.updatedIssue.workId,
    resortId: result.updatedIssue.resortId,
    fromStatus: result.issue.status,
    toStatus: result.updatedIssue.status,
  });

  return result.updatedIssue;
};

module.exports = {
  listIssueReports,
  createIssueReport,
  updateIssueReportStatus,
};
