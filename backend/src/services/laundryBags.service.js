const laundryBagsRepository = require('../repositories/laundryBags.repository');

const DEFAULT_TAKE = 50;
const MAX_TAKE = 100;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const assertWorkAccessible = async (client, workId, query = {}) => {
  const where = laundryBagsRepository.buildWorkspaceWhere({
    workspaceType: query.workspaceType,
    resortId: query.resortId,
  });

  const work = await laundryBagsRepository.findAccessibleWork({
    workId,
    where,
    client,
  });

  if (!work) {
    const error = new Error('Laundry Work not found');
    error.statusCode = 404;
    throw error;
  }

  return work;
};

const listLaundryBags = async (workId, query = {}) => {
  const take = Math.min(toPositiveInt(query.take, DEFAULT_TAKE), MAX_TAKE);
  const skip = Math.max(toPositiveInt(query.skip, 0), 0);

  const where = {
    ...laundryBagsRepository.buildWorkspaceWhere({
      workspaceType: query.workspaceType,
      resortId: query.resortId,
      status: query.status,
    }),
    workId: Number(workId),
  };

  const result = await laundryBagsRepository.listLaundryBags({
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

const getLaundryBagById = async (workId, bagId, query = {}) => {
  const where = {
    ...laundryBagsRepository.buildWorkspaceWhere({
      workspaceType: query.workspaceType,
      resortId: query.resortId,
    }),
    workId: Number(workId),
    id: Number(bagId),
  };

  const bag = await laundryBagsRepository.findLaundryBagById({ where });

  if (!bag) {
    const error = new Error('Laundry Bag not found');
    error.statusCode = 404;
    throw error;
  }

  return bag;
};

const createLaundryBag = async (workId, payload = {}) => {
  return laundryBagsRepository.transaction(async (tx) => {
    const work = await assertWorkAccessible(tx, workId);

    const bag = await laundryBagsRepository.createLaundryBag({
      data: {
        workId: work.id,
        resortId: work.resortId,
        bagNo: payload.bagNo,
        receivedAt: payload.receivedAt ? new Date(payload.receivedAt) : new Date(),
        note: payload.note || null,
      },
      client: tx,
    });

    await laundryBagsRepository.incrementLaundryWorkBagCount({
      workId: work.id,
      currentStatus: work.currentStatus,
      client: tx,
    });

    if (work.currentStatus === 'DRAFT') {
      await laundryBagsRepository.createWorkStatusLog({
        data: {
          workId: work.id,
          fromStatus: 'DRAFT',
          toStatus: 'BAG_RECEIVED',
          note: 'First bag received',
        },
        client: tx,
      });
    }

    return bag;
  });
};

const updateLaundryBagStatus = async (workId, bagId, payload = {}) => {
  return laundryBagsRepository.transaction(async (tx) => {
    await assertWorkAccessible(tx, workId);

    const currentBag = await laundryBagsRepository.findLaundryBagById({
      where: {
        id: Number(bagId),
        workId: Number(workId),
      },
      client: tx,
    });

    if (!currentBag) {
      const error = new Error('Laundry Bag not found');
      error.statusCode = 404;
      throw error;
    }

    const shouldSetOpenedAt = payload.toStatus === 'OPENED' && !currentBag.openedAt;

    return laundryBagsRepository.updateLaundryBagStatus({
      bagId: currentBag.id,
      data: {
        status: payload.toStatus,
        openedAt: payload.openedAt
          ? new Date(payload.openedAt)
          : shouldSetOpenedAt
            ? new Date()
            : currentBag.openedAt,
        note: payload.note !== undefined ? payload.note : currentBag.note,
      },
      client: tx,
    });
  });
};

module.exports = {
  listLaundryBags,
  getLaundryBagById,
  createLaundryBag,
  updateLaundryBagStatus,
};
