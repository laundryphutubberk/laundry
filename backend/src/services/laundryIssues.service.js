const laundryIssuesRepository = require('../repositories/laundryIssues.repository');
const laundryWorksRepository = require('../repositories/laundryWorks.repository');
const { logger } = require('../core/observability');
const { assertLaundryStaffActor } = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');

const buildIssueWhere = ({ actor, workId, status } = {}) => {
  const where = buildRequiredActorResortScopedWhere({ actor });
  if (workId) where.workId = Number(workId);
  if (status) where.status = status;
  return where;
};

const buildActorLogContext = (actor) => ({
  actorId: actor?.id,
  actorRole: actor?.role,
  workspaceType: actor?.workspaceType,
  actorResortId: actor?.resortId,
});

const assertWorkExists = async ({ workId, actor, client }) => {
  const work = await laundryWorksRepository.findLaundryWorkById({
    workId,
    where: buildRequiredActorResortScopedWhere({ actor }),
    client,
  });

  if (!work) {
    const error = new Error('Laundry Work not found');
    error.statusCode = 404;
    throw error;
  }

  if (['CLOSED', 'CANCELLED'].includes(work.currentStatus)) {
    const error = new Error('Issues cannot be changed on closed or cancelled Laundry Work');
    error.statusCode = 409;
    throw error;
  }

  return work;
};

const listLaundryIssues = async (workId, query = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  await assertWorkExists({ workId, actor });

  return laundryIssuesRepository.listLaundryIssues({
    where: buildIssueWhere({ actor, workId, status: query.status }),
  });
};

const createLaundryIssue = async (workId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);

  const issue = await laundryIssuesRepository.transaction(async (tx) => {
    const work = await assertWorkExists({ workId, actor, client: tx });
    const created = await laundryIssuesRepository.createLaundryIssue({
      data: {
        workId: work.id,
        resortId: work.resortId,
        itemTypeId: payload.itemTypeId,
        colorGroup: payload.colorGroup,
        issueType: payload.issueType,
        quantity: payload.quantity || 0,
        description: payload.description,
        status: 'OPEN',
        reportedById: actor.id,
      },
      client: tx,
    });

    await laundryIssuesRepository.updateWorkIssueCount({
      workId: work.id,
      resortId: work.resortId,
      client: tx,
    });

    return created;
  });

  logger.business('laundry.issue.created', {
    ...buildActorLogContext(actor),
    issueId: issue.id,
    workId: issue.workId,
    resortId: issue.resortId,
    issueType: issue.issueType,
    quantity: issue.quantity,
  });

  return issue;
};

const updateLaundryIssue = async (issueId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildIssueWhere({ actor });

  const issue = await laundryIssuesRepository.transaction(async (tx) => {
    const current = await laundryIssuesRepository.findLaundryIssueById({ issueId, where, client: tx });
    if (!current) {
      const error = new Error('Laundry Issue not found');
      error.statusCode = 404;
      throw error;
    }

    if (current.status === 'RESOLVED') {
      const error = new Error('Resolved Laundry Issue cannot be edited');
      error.statusCode = 409;
      throw error;
    }

    const updated = await laundryIssuesRepository.updateLaundryIssue({
      issueId,
      where,
      data: payload,
      client: tx,
    });

    await laundryIssuesRepository.updateWorkIssueCount({
      workId: current.workId,
      resortId: current.resortId,
      client: tx,
    });

    return updated;
  });

  logger.business('laundry.issue.updated', {
    ...buildActorLogContext(actor),
    issueId: issue.id,
    workId: issue.workId,
    resortId: issue.resortId,
    status: issue.status,
  });

  return issue;
};

const resolveLaundryIssue = async (issueId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildIssueWhere({ actor });

  const issue = await laundryIssuesRepository.transaction(async (tx) => {
    const current = await laundryIssuesRepository.findLaundryIssueById({ issueId, where, client: tx });
    if (!current) {
      const error = new Error('Laundry Issue not found');
      error.statusCode = 404;
      throw error;
    }

    if (current.status === 'RESOLVED') return current;
    if (current.status === 'CANCELLED') {
      const error = new Error('Cancelled Laundry Issue cannot be resolved');
      error.statusCode = 409;
      throw error;
    }

    const resolutionEntry = `Resolution: ${payload.resolutionNote}`;
    const description = current.description
      ? `${current.description}\n\n${resolutionEntry}`
      : resolutionEntry;

    const updated = await laundryIssuesRepository.updateLaundryIssue({
      issueId,
      where,
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        description,
      },
      client: tx,
    });

    await laundryIssuesRepository.updateWorkIssueCount({
      workId: current.workId,
      resortId: current.resortId,
      client: tx,
    });

    return updated;
  });

  logger.business('laundry.issue.resolved', {
    ...buildActorLogContext(actor),
    issueId: issue.id,
    workId: issue.workId,
    resortId: issue.resortId,
  });

  return issue;
};

module.exports = {
  listLaundryIssues,
  createLaundryIssue,
  updateLaundryIssue,
  resolveLaundryIssue,
};
