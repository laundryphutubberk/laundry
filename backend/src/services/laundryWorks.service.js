const laundryWorksBusiness = require('../domain/laundryWorks.business');
const laundryWorksRepository = require('../repositories/laundryWorks.repository');
const laundryWorksBusinessRepository = require('../repositories/laundryWorksBusiness.repository');
const { buildResortScopedWhere } = require('../policies/workspace.policy');
const { normalizePagination } = require('../shared/pagination');

const buildLaundryWorkWhere = ({ actor, workspaceType, resortId, status } = {}) => {
  const where = buildResortScopedWhere({ actor, workspaceType, resortId });

  if (status) {
    where.currentStatus = status;
  }

  return where;
};

const listLaundryWorks = async (query = {}, context = {}) => {
  const { skip, take } = normalizePagination(query);

  const where = buildLaundryWorkWhere({
    actor: context.actor,
    workspaceType: query.workspaceType,
    resortId: query.resortId,
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
    workspaceType: query.workspaceType,
    resortId: query.resortId,
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

const createLaundryWork = async (payload = {}) => {
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

const updateLaundryWorkStatus = async (workId, payload = {}) => {
  if (!payload.toStatus) {
    const error = new Error('toStatus is required');
    error.statusCode = 400;
    throw error;
  }

  return laundryWorksRepository.transaction(async (tx) => {
    const currentWork = await laundryWorksRepository.findLaundryWorkByIdForUpdate({
      workId,
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
      toStatus: payload.toStatus,
      client: tx,
    });

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
