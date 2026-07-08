const laundryWorksBusiness = require('../domain/laundryWorks.business');
const laundryWorksRepository = require('../repositories/laundryWorks.repository');
const laundryWorksBusinessRepository = require('../repositories/laundryWorksBusiness.repository');
const { assertLaundryStaffActor } = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');
const { normalizePagination } = require('../shared/pagination');

const buildLaundryWorkWhere = ({ actor, status } = {}) => {
  const where = buildRequiredActorResortScopedWhere({ actor });

  if (status) {
    where.currentStatus = status;
  }

  return where;
};

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

  return laundryWorksRepository.transaction(async (tx) => {
    laundryWorksBusiness.assertInitialWorkStatus(payload.currentStatus);

    const resort = await laundryWorksBusinessRepository.findResortById({
      resortId: payload.resortId,
      client: tx,
    });
    laundryWorksBusiness.assertResortCanReceiveWork(resort);

    const data = laundryWorksBusiness.buildCreateWorkData(payload);
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
};

const updateLaundryWorkStatus = async (workId, payload = {}, context = {}) => {
  assertLaundryStaffActor(context.actor);

  if (!payload.toStatus) {
    const error = new Error('toStatus is required');
    error.statusCode = 400;
    throw error;
  }

  return laundryWorksRepository.transaction(async (tx) => {
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

    return updatedWork;
  });
};

module.exports = {
  listLaundryWorks,
  getLaundryWorkById,
  createLaundryWork,
  updateLaundryWorkStatus,
};
