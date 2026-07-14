const laundryIssuesRepository = require('../repositories/laundryIssues.repository');
const laundryWorksRepository = require('../repositories/laundryWorks.repository');
const { logger } = require('../core/observability');
const { assertLaundryStaffActor } = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');
const { normalizePagination } = require('../shared/pagination');

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

const getAccessibleWork = async ({ workId, actor, client }) => {
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

  return work;
};

const assertWorkAllowsIssueMutation = (work) => {
  if (['CLOSED', 'CANCELLED'].includes(work.currentStatus)) {
    const error = new Error('Issues cannot be changed on closed or cancelled Laundry Work');
    error.statusCode = 409;
    throw error;
  }

  return work;
};

const getMutableAccessibleWork = async ({ workId, actor, client }) => {
  const work = await getAccessibleWork({ workId, actor, client });
  return assertWorkAllowsIssueMutation(work);
};

const assertIssueLinks = async ({ work, bagId, countLineId, client }) => {
  let bag = null;
  let countLine = null;

  if (bagId) {
    bag = await laundryIssuesRepository.findScopedBag({
      bagId,
      workId: work.id,
      resortId: work.resortId,
      client,
    });
    if (!bag) {
      const error = new Error('Laundry Bag does not belong to this Laundry Work');
      error.statusCode = 409;
      throw error;
    }
  }

  if (countLineId) {
    countLine = await laundryIssuesRepository.findScopedCountLine({
      countLineId,
      workId: work.id,
      resortId: work.resortId,
      client,
    });
    if (!countLine) {
      const error = new Error('Laundry Count Line does not belong to this Laundry Work');
      error.statusCode = 409;
      throw error;
    }
  }

  if (bag && countLine?.bagId && Number(countLine.bagId) !== Number(bag.id)) {
    const error = new Error('Laundry Count Line does not belong to the selected Laundry Bag');
    error.statusCode = 409;
    throw error;
  }

  return { bag, countLine };
};

const listLaundryIssues = async (workId, query = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  await getAccessibleWork({ workId, actor });

  return laundryIssuesRepository.listLaundryIssues({
    where: buildIssueWhere({ actor, workId, status: query.status }),
  });
};

const listGlobalLaundryIssues = async (query = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const { skip, take } = normalizePagination(query);
  const where = buildIssueWhere({ actor, status: query.status });
  const filters = [];

  if (query.active === 'true') filters.push({ status: { in: ['OPEN', 'REVIEWING'] } });
  if (query.active === 'false') filters.push({ status: { in: ['RESOLVED', 'CANCELLED'] } });
  if (query.issueType) filters.push({ issueType: query.issueType });
  if (query.search) {
    const search = String(query.search).trim();
    if (search) {
      filters.push({
        OR: [
          { description: { contains: search, mode: 'insensitive' } },
          { work: { workNo: { contains: search, mode: 'insensitive' } } },
          { resort: { name: { contains: search, mode: 'insensitive' } } },
        ],
      });
    }
  }
  if (filters.length) where.AND = filters;

  const result = await laundryIssuesRepository.listGlobalLaundryIssues({ where, skip, take });
  return { items: result.items, pagination: { total: result.total, skip, take } };
};

const createLaundryIssue = async (workId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);

  const issue = await laundryIssuesRepository.transaction(async (tx) => {
    const work = await getMutableAccessibleWork({ workId, actor, client: tx });
    const { countLine } = await assertIssueLinks({
      work,
      bagId: payload.bagId,
      countLineId: payload.countLineId,
      client: tx,
    });
    const created = await laundryIssuesRepository.createLaundryIssue({
      data: {
        workId: work.id,
        resortId: work.resortId,
        itemTypeId: payload.itemTypeId || countLine?.itemTypeId,
        colorGroup: payload.colorGroup || countLine?.colorGroup,
        issueType: payload.issueType,
        quantity: payload.quantity || 0,
        description: payload.description,
        status: 'OPEN',
        reportedById: actor.id,
      },
      client: tx,
    });

    await laundryIssuesRepository.updateLaundryIssueLinks({
      issueId: created.id,
      bagId: payload.bagId || countLine?.bagId || null,
      countLineId: payload.countLineId || null,
      client: tx,
    });

    await laundryIssuesRepository.updateWorkIssueCount({
      workId: work.id,
      resortId: work.resortId,
      client: tx,
    });

    return laundryIssuesRepository.findLaundryIssueById({
      issueId: created.id,
      where: buildIssueWhere({ actor, workId: work.id }),
      client: tx,
    });
  });

  logger.business('laundry.issue.created', {
    ...buildActorLogContext(actor),
    issueId: issue.id,
    workId: issue.workId,
    resortId: issue.resortId,
    bagId: issue.bagId,
    countLineId: issue.countLineId,
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

    if (['RESOLVED', 'CANCELLED'].includes(current.status)) {
      const error = new Error('Resolved or cancelled Laundry Issue cannot be edited');
      error.statusCode = 409;
      throw error;
    }

    const work = await getMutableAccessibleWork({ workId: current.workId, actor, client: tx });
    const nextBagId = payload.bagId === undefined ? current.bagId : payload.bagId;
    const nextCountLineId = payload.countLineId === undefined ? current.countLineId : payload.countLineId;
    const { countLine } = await assertIssueLinks({
      work,
      bagId: nextBagId,
      countLineId: nextCountLineId,
      client: tx,
    });

    const {
      bagId: _bagId,
      countLineId: _countLineId,
      ...issueData
    } = payload;

    if (countLine && issueData.itemTypeId === undefined) issueData.itemTypeId = countLine.itemTypeId;
    if (countLine && issueData.colorGroup === undefined) issueData.colorGroup = countLine.colorGroup;

    await laundryIssuesRepository.updateLaundryIssue({
      issueId,
      where,
      data: issueData,
      client: tx,
    });

    await laundryIssuesRepository.updateLaundryIssueLinks({
      issueId,
      bagId: nextBagId || null,
      countLineId: nextCountLineId || null,
      client: tx,
    });

    await laundryIssuesRepository.updateWorkIssueCount({
      workId: current.workId,
      resortId: current.resortId,
      client: tx,
    });

    return laundryIssuesRepository.findLaundryIssueById({ issueId, where, client: tx });
  });

  logger.business('laundry.issue.updated', {
    ...buildActorLogContext(actor),
    issueId: issue.id,
    workId: issue.workId,
    resortId: issue.resortId,
    bagId: issue.bagId,
    countLineId: issue.countLineId,
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

    await getMutableAccessibleWork({ workId: current.workId, actor, client: tx });

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

const reopenLaundryIssue = async (issueId, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildIssueWhere({ actor });
  const issue = await laundryIssuesRepository.transaction(async (tx) => {
    const current = await laundryIssuesRepository.findLaundryIssueById({ issueId, where, client: tx });
    if (!current) throw Object.assign(new Error('Laundry Issue not found'), { statusCode: 404 });
    if (current.status !== 'RESOLVED') throw Object.assign(new Error('Only resolved Laundry Issue can be reopened'), { statusCode: 409 });
    await getMutableAccessibleWork({ workId: current.workId, actor, client: tx });
    const updated = await laundryIssuesRepository.updateLaundryIssue({
      issueId,
      where,
      data: { status: 'OPEN', resolvedAt: null },
      client: tx,
    });
    await laundryIssuesRepository.updateWorkIssueCount({ workId: current.workId, resortId: current.resortId, client: tx });
    return updated;
  });
  logger.business('laundry.issue.reopened', { ...buildActorLogContext(actor), issueId: issue.id, workId: issue.workId, resortId: issue.resortId });
  return issue;
};

module.exports = {
  listLaundryIssues,
  listGlobalLaundryIssues,
  createLaundryIssue,
  updateLaundryIssue,
  resolveLaundryIssue,
  reopenLaundryIssue,
};
