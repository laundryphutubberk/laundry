const laundryWorksRepository = require('../repositories/laundryWorks.repository');

const DEFAULT_TAKE = 50;
const MAX_TAKE = 100;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const listLaundryWorks = async (query = {}) => {
  const take = Math.min(toPositiveInt(query.take, DEFAULT_TAKE), MAX_TAKE);
  const skip = Math.max(toPositiveInt(query.skip, 0), 0);

  const where = laundryWorksRepository.buildWorkspaceWhere({
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

const getLaundryWorkById = async (workId, query = {}) => {
  const where = laundryWorksRepository.buildWorkspaceWhere({
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

  const workNo = payload.workNo || `LW-${Date.now()}`;

  return laundryWorksRepository.createLaundryWork({
    data: {
      workNo,
      resortId: Number(payload.resortId),
      bagCount: payload.bagCount ? Number(payload.bagCount) : 0,
      receivedDate: payload.receivedDate ? new Date(payload.receivedDate) : null,
      note: payload.note || null,
      currentStatus: payload.currentStatus || 'DRAFT',
    },
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

    const updatedWork = await laundryWorksRepository.updateLaundryWorkStatus({
      workId,
      toStatus: payload.toStatus,
      client: tx,
    });

    await laundryWorksRepository.createWorkStatusLog({
      data: {
        workId: Number(workId),
        fromStatus: currentWork.currentStatus,
        toStatus: payload.toStatus,
        changedById: payload.changedById ? Number(payload.changedById) : null,
        changedByName: payload.changedByName || null,
        note: payload.note || null,
      },
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
