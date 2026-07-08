const laundryBagsBusiness = require('../domain/laundryBags.business');
const laundryBagsRepository = require('../repositories/laundryBags.repository');
const { logger } = require('../core/observability');
const { assertLaundryStaffActor } = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');
const { normalizePagination } = require('../shared/pagination');

const buildLaundryBagWhere = ({ actor, status } = {}) => {
  const where = buildRequiredActorResortScopedWhere({ actor });

  if (status) {
    where.status = status;
  }

  return where;
};

const buildActorLogContext = (actor) => ({
  actorId: actor?.id,
  actorRole: actor?.role,
  workspaceType: actor?.workspaceType,
  actorResortId: actor?.resortId,
});

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
  assertLaundryStaffActor(context.actor);

  const bag = await laundryBagsRepository.transaction(async (tx) => {
    const work = await assertWorkAccessible(tx, workId, {}, context);
    laundryBagsBusiness.assertWorkCanReceiveBag(work);

    const existingBag = await laundryBagsRepository.findLaundryBagByBagNo({
      workId: work.id,
      bagNo: payload.bagNo,
      client: tx,
    });
    laundryBagsBusiness.assertUniqueBagNo(existingBag);

    const createdBag = await laundryBagsRepository.createLaundryBag({
      data: {
        workId: work.id,
        resortId: work.resortId,
        bagNo: payload.bagNo,
        receivedAt: payload.receivedAt ? new Date(payload.receivedAt) : new Date(),
        note: payload.note || null,
      },
      client: tx,
    });

    const workUpdateResult = await laundryBagsRepository.incrementLaundryWorkBagCount({
      workId: work.id,
      expectedStatus: work.currentStatus,
      nextStatus: laundryBagsBusiness.getNextWorkStatusAfterBagReceived(work.currentStatus),
      client: tx,
    });

    if (workUpdateResult.count === 0) {
      const error = new Error('Laundry Work status changed during bag receive');
      error.statusCode = 409;
      throw error;
    }

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

    return createdBag;
  });

  logger.business('laundry.bag.received', {
    ...buildActorLogContext(context.actor),
    workId: bag.workId,
    bagId: bag.id,
    bagNo: bag.bagNo,
    resortId: bag.resortId,
    status: bag.status,
  });

  return bag;
};

const updateLaundryBagStatus = async (workId, bagId, payload = {}, context = {}) => {
  assertLaundryStaffActor(context.actor);

  const result = await laundryBagsRepository.transaction(async (tx) => {
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

    const updatedBag = await laundryBagsRepository.updateLaundryBagStatus({
      bagId: currentBag.id,
      expectedStatus: currentBag.status,
      data: laundryBagsBusiness.buildBagStatusUpdateData({ currentBag, payload }),
      client: tx,
    });

    if (!updatedBag) {
      const error = new Error('Laundry Bag status changed during update');
      error.statusCode = 409;
      throw error;
    }

    return {
      currentBag,
      updatedBag,
    };
  });

  logger.business('laundry.bag.status_changed', {
    ...buildActorLogContext(context.actor),
    workId: result.updatedBag.workId,
    bagId: result.updatedBag.id,
    bagNo: result.updatedBag.bagNo,
    resortId: result.updatedBag.resortId,
    fromStatus: result.currentBag.status,
    toStatus: result.updatedBag.status,
  });

  return result.updatedBag;
};

module.exports = {
  listLaundryBags,
  getLaundryBagById,
  createLaundryBag,
  updateLaundryBagStatus,
};
