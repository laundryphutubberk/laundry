const laundryBagsBusiness = require('../domain/laundryBags.business');
const laundryBagsRepository = require('../repositories/laundryBags.repository');
const { buildResortScopedWhere } = require('../policies/workspace.policy');
const { normalizePagination } = require('../shared/pagination');

const buildLaundryBagWhere = ({ workspaceType, resortId, status } = {}) => {
  const where = buildResortScopedWhere({ workspaceType, resortId });

  if (status) {
    where.status = status;
  }

  return where;
};

const assertWorkAccessible = async (client, workId, query = {}) => {
  const where = buildLaundryBagWhere({
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
  const { skip, take } = normalizePagination(query);

  await assertWorkAccessible(undefined, workId, query);

  const where = {
    ...buildLaundryBagWhere({
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
    ...buildLaundryBagWhere({
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
    laundryBagsBusiness.assertWorkCanReceiveBag(work);

    const existingBag = await laundryBagsRepository.findLaundryBagByBagNo({
      workId: work.id,
      bagNo: payload.bagNo,
      client: tx,
    });
    laundryBagsBusiness.assertUniqueBagNo(existingBag);

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
      nextStatus: laundryBagsBusiness.getNextWorkStatusAfterBagReceived(work.currentStatus),
      client: tx,
    });

    if (laundryBagsBusiness.shouldCreateFirstBagStatusLog(work)) {
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

    return laundryBagsRepository.updateLaundryBagStatus({
      bagId: currentBag.id,
      data: laundryBagsBusiness.buildBagStatusUpdateData({ currentBag, payload }),
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
