const laundryWorksBusiness = require('../domain/laundryWorks.business');
const laundryWorksRepository = require('../repositories/laundryWorks.repository');
const laundryWorksBusinessRepository = require('../repositories/laundryWorksBusiness.repository');
const { logger } = require('../core/observability');
const { assertLaundryStaffActor, assertLaundryManagementActor } = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');
const { normalizePagination } = require('../shared/pagination');

const buildLaundryWorkWhere = ({ actor, status } = {}) => {
  const where = buildRequiredActorResortScopedWhere({ actor });

  if (status) {
    where.currentStatus = status;
  }

  return where;
};

const buildActorLogContext = (actor) => ({
  actorId: actor?.id,
  actorRole: actor?.role,
  workspaceType: actor?.workspaceType,
  actorResortId: actor?.resortId,
});

const listLaundryWorks = async (query = {}, context = {}) => {
  const { skip, take } = normalizePagination(query);

  const where = buildLaundryWorkWhere({
    actor: context.actor,
    status: query.status,
  });

  const result = await laundryWorksRepository.listLaundryWorks({
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

const getLaundryWorkById = async (workId, query = {}, context = {}) => {
  const where = buildLaundryWorkWhere({
    actor: context.actor,
  });

  const work = await laundryWorksRepository.findLaundryWorkById({
    workId,
    where,
  });

  if (!work) {
    const error = new Error('Laundry Work not found');
    error.statusCode = 404;
    throw error;
  }

  return work;
};

const createLaundryWork = async (payload = {}, context = {}) => {
  assertLaundryStaffActor(context.actor);

  if (!payload.resortId) {
    const error = new Error('resortId is required');
    error.statusCode = 400;
    throw error;
  }

  const work = await laundryWorksRepository.transaction(async (tx) => {
    laundryWorksBusiness.assertInitialWorkStatus(payload.currentStatus);

    const resort = await laundryWorksBusinessRepository.findResortById({
      resortId: payload.resortId,
      client: tx,
    });
    laundryWorksBusiness.assertResortCanReceiveWork(resort);

    let generatedWorkNo;

    if (!payload.workNo) {
      const workNoPrefix = laundryWorksBusiness.buildWorkNoPrefix();
      const latestWork = await laundryWorksBusinessRepository.findLatestLaundryWorkByPrefix({
        workNoPrefix,
        client: tx,
      });

      generatedWorkNo = laundryWorksBusiness.buildNextWorkNo({
        prefix: workNoPrefix,
        latestWorkNo: latestWork?.workNo,
      });
    }

    const data = laundryWorksBusiness.buildCreateWorkData(payload, generatedWorkNo);
    const existingWork = await laundryWorksBusinessRepository.findLaundryWorkByWorkNo({
      workNo: data.workNo,
      client: tx,
    });
    laundryWorksBusiness.assertUniqueWorkNo(existingWork);

    return laundryWorksRepository.createLaundryWork({
      data,
      client: tx,
    });
  });

  logger.business('laundry.work.created', {
    ...buildActorLogContext(context.actor),
    workId: work.id,
    workNo: work.workNo,
    resortId: work.resortId,
    status: work.currentStatus,
  });

  return work;
};

const updateLaundryWorkStatus = async (workId, payload = {}, context = {}) => {
  if (!payload.toStatus) {
    const error = new Error('toStatus is required');
    error.statusCode = 400;
    throw error;
  }

  const result = await laundryWorksRepository.transaction(async (tx) => {
    const where = buildRequiredActorResortScopedWhere({ actor: context.actor });

    const currentWork = await laundryWorksRepository.findLaundryWorkByIdForUpdate({
      workId,
      where,
      client: tx,
    });

    if (!currentWork) {
      const error = new Error('Laundry Work not found');
      error.statusCode = 404;
      throw error;
    }

    laundryWorksBusiness.assertWorkStatusTransition(currentWork.currentStatus, payload.toStatus);

    const updatedWork = await laundryWorksRepository.updateLaundryWorkStatus({
      workId,
      where,
      expectedStatus: currentWork.currentStatus,
      toStatus: payload.toStatus,
      client: tx,
    });

    if (!updatedWork) {
      const error = new Error('Laundry Work status changed during update');
      error.statusCode = 409;
      throw error;
    }

    await laundryWorksRepository.createWorkStatusLog({
      data: laundryWorksBusiness.buildStatusLogData({
        workId,
        fromStatus: currentWork.currentStatus,
        payload,
      }),
      client: tx,
    });

    return {
      currentWork,
      updatedWork,
    };
  });

  logger.business('laundry.work.status_changed', {
    ...buildActorLogContext(context.actor),
    workId: result.updatedWork.id,
    workNo: result.updatedWork.workNo,
    resortId: result.updatedWork.resortId,
    fromStatus: result.currentWork.currentStatus,
    toStatus: result.updatedWork.currentStatus,
  });

  return result.updatedWork;
};

const deleteOrCancelLaundryWork = async (workId, payload = {}, context = {}) => {
  const actor = assertLaundryManagementActor(context.actor);
  const result = await laundryWorksRepository.transaction(async (tx) => {
    const where = buildRequiredActorResortScopedWhere({ actor });
    const currentWork = await laundryWorksRepository.findLaundryWorkByIdForUpdate({
      workId,
      where,
      client: tx,
    });

    if (!currentWork) {
      const error = new Error('Laundry Work not found');
      error.statusCode = 404;
      throw error;
    }

    if (['CLOSED', 'CANCELLED'].includes(currentWork.currentStatus)) {
      const error = new Error('Closed or cancelled Laundry Work cannot be removed');
      error.statusCode = 409;
      throw error;
    }

    const childCount = Object.values(currentWork._count || {}).reduce((total, count) => total + Number(count || 0), 0);
    const canHardDelete = currentWork.currentStatus === 'DRAFT' && childCount === 0;

    if (canHardDelete) {
      const deleted = await laundryWorksRepository.deleteLaundryWork({ workId, where, client: tx });
      if (!deleted) {
        const error = new Error('Laundry Work changed during delete');
        error.statusCode = 409;
        throw error;
      }

      return { action: 'DELETED', work: currentWork };
    }

    laundryWorksBusiness.assertWorkStatusTransition(currentWork.currentStatus, 'CANCELLED');
    const updatedWork = await laundryWorksRepository.updateLaundryWorkStatus({
      workId,
      where,
      expectedStatus: currentWork.currentStatus,
      toStatus: 'CANCELLED',
      client: tx,
    });

    if (!updatedWork) {
      const error = new Error('Laundry Work status changed during cancellation');
      error.statusCode = 409;
      throw error;
    }

    await laundryWorksRepository.createWorkStatusLog({
      data: laundryWorksBusiness.buildStatusLogData({
        workId,
        fromStatus: currentWork.currentStatus,
        payload: {
          toStatus: 'CANCELLED',
          changedById: actor.id,
          changedByName: actor.displayName,
          note: payload.reason,
        },
      }),
      client: tx,
    });

    return { action: 'CANCELLED', work: updatedWork };
  });

  logger.business(result.action === 'DELETED' ? 'laundry.work.deleted' : 'laundry.work.cancelled', {
    ...buildActorLogContext(actor),
    workId: result.work.id,
    workNo: result.work.workNo,
    resortId: result.work.resortId,
    reason: payload.reason,
  });

  return result;
};

module.exports = {
  listLaundryWorks,
  getLaundryWorkById,
  createLaundryWork,
  updateLaundryWorkStatus,
  deleteOrCancelLaundryWork,
};
