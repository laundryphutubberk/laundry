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
  actorId: actor?.userId,
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
  const actor = assertLaundryStaffActor(context.actor);

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
      await laundryWorksBusinessRepository.lockLaundryWorkNumberPrefix({
        workNoPrefix,
        client: tx,
      });
      const latestWork = await laundryWorksBusinessRepository.findLatestLaundryWorkByPrefix({
        workNoPrefix,
        client: tx,
      });

      generatedWorkNo = laundryWorksBusiness.buildNextWorkNo({
        prefix: workNoPrefix,
        latestWorkNo: latestWork?.workNo,
      });
    }

    const data = laundryWorksBusiness.buildCreateWorkData(payload, generatedWorkNo, actor);
    const existingWork = await laundryWorksBusinessRepository.findLaundryWorkByWorkNo({
      workNo: data.workNo,
      client: tx,
    });
    laundryWorksBusiness.assertUniqueWorkNo(existingWork);

    const createdWork = await laundryWorksRepository.createLaundryWork({
      data,
      client: tx,
    });

    if (createdWork.currentStatus === 'BAG_RECEIVED') {
      await laundryWorksRepository.createWorkStatusLog({
        data: laundryWorksBusiness.buildStatusLogData({
          workId: createdWork.id,
          fromStatus: 'DRAFT',
          payload: {
            toStatus: 'BAG_RECEIVED',
            note: 'Initial bags received with Laundry Work creation',
          },
          actor,
        }),
        client: tx,
      });
    }

    return createdWork;
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
  const actor = assertLaundryStaffActor(context.actor);

  if (!payload.toStatus) {
    const error = new Error('toStatus is required');
    error.statusCode = 400;
    throw error;
  }

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
        actor,
      }),
      client: tx,
    });

    return {
      currentWork,
      updatedWork,
    };
  });

  logger.business('laundry.work.status_changed', {
    ...buildActorLogContext(actor),
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
          note: payload.reason,
        },
        actor,
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

const confirmLaundryWorkSorting = async (workId, stage, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const config = stage === 'TYPE'
    ? { fromStatus: 'ITEM_COUNTED', toStatus: 'TYPE_SORTED', validate: laundryWorksBusiness.assertTypeSortingCanComplete }
    : { fromStatus: 'TYPE_SORTED', toStatus: 'COLOR_SORTED', validate: laundryWorksBusiness.assertColorSortingCanComplete };

  return laundryWorksRepository.transaction(async (tx) => {
    const where = buildRequiredActorResortScopedWhere({ actor });
    const work = await laundryWorksRepository.findLaundryWorkByIdForUpdate({ workId, where, client: tx });
    if (!work) {
      const error = new Error('Laundry Work not found');
      error.statusCode = 404;
      throw error;
    }
    if (work.currentStatus !== config.fromStatus) {
      const error = new Error(`Laundry Work must be ${config.fromStatus} for this confirmation`);
      error.statusCode = 409;
      throw error;
    }
    const countLines = await laundryWorksRepository.findCountLinesForRecording({ workId, client: tx });
    config.validate(countLines);
    const updated = await laundryWorksRepository.updateLaundryWorkStatus({
      workId,
      where,
      expectedStatus: config.fromStatus,
      toStatus: config.toStatus,
      client: tx,
    });
    if (!updated) {
      const error = new Error('Laundry Work status changed during sorting confirmation');
      error.statusCode = 409;
      throw error;
    }
    await laundryWorksRepository.createWorkStatusLog({
      data: {
        workId: Number(workId),
        fromStatus: config.fromStatus,
        toStatus: config.toStatus,
        changedById: actor.userId,
        note: payload.note || `${stage} sorting confirmed`,
      },
      client: tx,
    });
    return updated;
  });
};

const recordLaundryWorkData = async (workId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  return laundryWorksRepository.transaction(async (tx) => {
    await laundryWorksRepository.lockWorkDataRecording({ workId, client: tx });
    const where = buildRequiredActorResortScopedWhere({ actor });
    const work = await laundryWorksRepository.findLaundryWorkByIdForUpdate({ workId, where, client: tx });
    if (!work) {
      const error = new Error('Laundry Work not found');
      error.statusCode = 404;
      throw error;
    }
    if (work.currentStatus !== 'COLOR_SORTED') {
      const error = new Error('Laundry Work must be COLOR_SORTED before data recording');
      error.statusCode = 409;
      throw error;
    }
    if (await laundryWorksRepository.countRecordedMovements({ workId, client: tx })) {
      const error = new Error('Laundry Work data has already been recorded');
      error.statusCode = 409;
      throw error;
    }
    const countLines = await laundryWorksRepository.findCountLinesForRecording({ workId, client: tx });
    laundryWorksBusiness.assertTypeSortingCanComplete(countLines);
    laundryWorksBusiness.assertColorSortingCanComplete(countLines);
    const groups = laundryWorksBusiness.aggregateRecordedCountLines(countLines);
    await laundryWorksRepository.createCountedMovements({ work, groups, client: tx });
    await laundryWorksRepository.upsertInventorySummaries({ work, groups, client: tx });
    const updated = await laundryWorksRepository.updateLaundryWorkStatus({
      workId,
      where,
      expectedStatus: 'COLOR_SORTED',
      toStatus: 'DATA_RECORDED',
      client: tx,
    });
    if (!updated) {
      const error = new Error('Laundry Work status changed during data recording');
      error.statusCode = 409;
      throw error;
    }
    await laundryWorksRepository.createWorkStatusLog({
      data: {
        workId: Number(workId),
        fromStatus: 'COLOR_SORTED',
        toStatus: 'DATA_RECORDED',
        changedById: actor.userId,
        note: payload.note || 'Work data recorded to Inventory',
      },
      client: tx,
    });
    return { work: updated, movementsCreated: groups.length, groups };
  });
};

const confirmLaundryWorkReturn = async (workId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const result = await laundryWorksRepository.transaction(async (tx) => {
    await laundryWorksRepository.lockWorkCommand({ workId, command: 'return', client: tx });
    const where = buildRequiredActorResortScopedWhere({ actor });
    const work = await laundryWorksRepository.findLaundryWorkByIdForUpdate({ workId, where, client: tx });
    if (!work) { const error = new Error('Laundry Work not found'); error.statusCode = 404; throw error; }
    if (work.currentStatus !== 'DATA_RECORDED') { const error = new Error('Laundry Work must be DATA_RECORDED before return'); error.statusCode = 409; throw error; }
    if (await laundryWorksRepository.countReturnMovements({ workId, client: tx })) { const error = new Error('Laundry Work return has already been confirmed'); error.statusCode = 409; throw error; }
    const countLines = await laundryWorksRepository.findCountLinesForRecording({ workId, client: tx });
    const recordedMovements = await laundryWorksRepository.findRecordedMovements({ workId, client: tx });
    const groups = laundryWorksBusiness.assertReturnCanComplete({ countLines, recordedMovements });
    await laundryWorksRepository.createReturnMovements({ work, groups, client: tx });
    await laundryWorksRepository.applyReturnedInventory({ work, groups, client: tx });
    const updated = await laundryWorksRepository.updateLaundryWorkStatus({ workId, where, expectedStatus: 'DATA_RECORDED', toStatus: 'RETURNED', timestamps: { returnedAt: new Date() }, client: tx });
    if (!updated) { const error = new Error('Laundry Work status changed during return confirmation'); error.statusCode = 409; throw error; }
    await laundryWorksRepository.createWorkStatusLog({ data: { workId: Number(workId), fromStatus: 'DATA_RECORDED', toStatus: 'RETURNED', changedById: actor.userId, changedByName: actor.displayName || null, note: payload.note || 'Laundry Work returned to Resort' }, client: tx });
    return { work: updated, movementsCreated: groups.length };
  });
  logger.business('laundry.work.returned', { ...buildActorLogContext(actor), workId: result.work.id, resortId: result.work.resortId });
  return result;
};

const closeLaundryWork = async (workId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const work = await laundryWorksRepository.transaction(async (tx) => {
    await laundryWorksRepository.lockWorkCommand({ workId, command: 'close', client: tx });
    const where = buildRequiredActorResortScopedWhere({ actor });
    const current = await laundryWorksRepository.findLaundryWorkByIdForUpdate({ workId, where, client: tx });
    if (!current) { const error = new Error('Laundry Work not found'); error.statusCode = 404; throw error; }
    if (current.currentStatus !== 'RETURNED') { const error = new Error('Laundry Work must be RETURNED before closure'); error.statusCode = 409; throw error; }
    const updated = await laundryWorksRepository.updateLaundryWorkStatus({ workId, where, expectedStatus: 'RETURNED', toStatus: 'CLOSED', timestamps: { closedAt: new Date() }, client: tx });
    if (!updated) { const error = new Error('Laundry Work status changed during closure'); error.statusCode = 409; throw error; }
    await laundryWorksRepository.createWorkStatusLog({ data: { workId: Number(workId), fromStatus: 'RETURNED', toStatus: 'CLOSED', changedById: actor.userId, changedByName: actor.displayName || null, note: payload.note || 'Laundry Work closed' }, client: tx });
    return updated;
  });
  logger.business('laundry.work.closed', { ...buildActorLogContext(actor), workId: work.id, resortId: work.resortId });
  return work;
};

module.exports = {
  listLaundryWorks,
  getLaundryWorkById,
  createLaundryWork,
  updateLaundryWorkStatus,
  deleteOrCancelLaundryWork,
  confirmLaundryWorkSorting,
  recordLaundryWorkData,
  confirmLaundryWorkReturn,
  closeLaundryWork,
};
