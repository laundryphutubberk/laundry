const ACTIVE_ISSUE_STATUSES = new Set(['OPEN', 'REVIEWING']);

const WORK_STATUSES_ACCEPTING_ISSUES = new Set([
  'BAG_OPENED',
  'ITEM_COUNTED',
  'TYPE_SORTED',
  'COLOR_SORTED',
  'DATA_RECORDED',
  'RETURNED',
]);

const ISSUE_STATUS_TRANSITIONS = {
  OPEN: new Set(['REVIEWING', 'RESOLVED', 'CANCELLED']),
  REVIEWING: new Set(['OPEN', 'RESOLVED', 'CANCELLED']),
  RESOLVED: new Set([]),
  CANCELLED: new Set([]),
};

const createBusinessError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertWorkCanReceiveIssue = (work) => {
  if (!work) {
    throw createBusinessError('Laundry Work not found', 404);
  }

  if (!WORK_STATUSES_ACCEPTING_ISSUES.has(work.currentStatus)) {
    throw createBusinessError('Laundry Work is not ready for issue reports');
  }
};

const assertIssueQuantity = (quantity) => {
  const parsed = Number(quantity || 0);

  if (!Number.isInteger(parsed)) {
    throw createBusinessError('issue quantity must be an integer');
  }

  if (parsed < 0) {
    throw createBusinessError('issue quantity cannot be negative');
  }
};

const assertOptionalItemTypeCanBeUsed = (itemType) => {
  if (!itemType) {
    return;
  }

  if (itemType.active === false) {
    throw createBusinessError('Inactive Laundry Item Type cannot be used in issue reports');
  }
};

const assertIssueCanChangeStatus = (issue) => {
  if (!issue) {
    throw createBusinessError('Issue Report not found', 404);
  }

  if (!ACTIVE_ISSUE_STATUSES.has(issue.status)) {
    throw createBusinessError('Issue Report is already closed');
  }
};

const assertIssueStatusTransition = (currentStatus, nextStatus) => {
  const allowedStatuses = ISSUE_STATUS_TRANSITIONS[currentStatus] || new Set();

  if (!allowedStatuses.has(nextStatus)) {
    throw createBusinessError(`Cannot change Issue Report status from ${currentStatus} to ${nextStatus}`);
  }
};

const buildCreateIssueReportData = ({ work, payload }) => {
  assertIssueQuantity(payload.quantity);

  return {
    workId: work.id,
    resortId: work.resortId,
    itemTypeId: payload.itemTypeId ? Number(payload.itemTypeId) : null,
    colorGroup: payload.colorGroup || null,
    issueType: payload.issueType,
    quantity: Number(payload.quantity || 0),
    description: payload.description || null,
    status: payload.status || 'OPEN',
    reportedById: payload.reportedById ? Number(payload.reportedById) : null,
  };
};

const buildIssueStatusUpdateData = ({ issue, payload }) => {
  assertIssueCanChangeStatus(issue);
  assertIssueStatusTransition(issue.status, payload.toStatus);

  return {
    status: payload.toStatus,
    resolvedAt: ACTIVE_ISSUE_STATUSES.has(payload.toStatus) ? null : new Date(),
  };
};

const shouldIncrementWorkIssueCount = (status) => status === 'OPEN' || status === 'REVIEWING';

module.exports = {
  assertWorkCanReceiveIssue,
  assertIssueQuantity,
  assertOptionalItemTypeCanBeUsed,
  assertIssueCanChangeStatus,
  assertIssueStatusTransition,
  buildCreateIssueReportData,
  buildIssueStatusUpdateData,
  shouldIncrementWorkIssueCount,
};
