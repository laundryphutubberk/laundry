const laundryBagsBusiness = require('../domain/laundryBags.business');
const laundryBagsRepository = require('../repositories/laundryBags.repository');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');
const { normalizePagination } = require('../shared/pagination');

const buildLaundryBagWhere = ({ actor, status } = {}) => {
  const where = buildRequiredActorResortScopedWhere({ actor });

  if (status) {
    where.status = status;
  }

  return where;
};

const assertWorkAccessible = async (client, workId, query = {}, context = {}) => {
  const where = buildLaundryBagWhere({
    actor: context.actor,
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

const listLaundryBags = async (workId, query = {}, context = {}) => {
  const { skip, take } = normalizePagination(query);

  await assertWorkAccessible(undefined, workId, query, context);

  const where = {
    ...buildLaundryBagWhere({
      actor: context.actor,
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

const getLaundryBagById = async (workId, bagId, query = {}, context = {}) => {
  const where = {
    ...buildLaundryBagWhere({
      actor: context.actor,
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

const createLaundryBag = async (workId, payload = {}, context = {}) => {
  return laundryBagsRepository.transaction(async (tx) => {
    const work = await assertWorkAccessible(tx, workId, {}, context);
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

const updateLaundryBagStatus = async (workId, bagId, payload = {}, context = {}) => {
  return laundryBagsRepository.transaction(async (tx) => {
    await assertWorkAccessible(tx, workId, {}, context);

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
