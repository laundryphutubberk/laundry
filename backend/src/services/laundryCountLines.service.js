const laundryCountLinesBusiness = require('../domain/laundryCountLines.business');
const laundryCountLinesRepository = require('../repositories/laundryCountLines.repository');
const { logger } = require('../core/observability');
const { assertLaundryStaffActor } = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');
const { normalizePagination } = require('../shared/pagination');

const buildLaundryCountLineWhere = ({ actor } = {}) => buildRequiredActorResortScopedWhere({ actor });

const buildActorLogContext = (actor) => ({
  actorId: actor?.id,
  actorRole: actor?.role,
  workspaceType: actor?.workspaceType,
  actorResortId: actor?.resortId,
});

const listLaundryCountLines = async (workId, query = {}, context = {}) => {
  const { skip, take } = normalizePagination(query);

  const where = {
    ...buildLaundryCountLineWhere({ actor: context.actor }),
    workId: Number(workId),
  };

  const result = await laundryCountLinesRepository.listLaundryCountLines({
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

const createLaundryCountLine = async (workId, payload = {}, context = {}) => {
  assertLaundryStaffActor(context.actor);

  const countLine = await laundryCountLinesRepository.transaction(async (tx) => {
    const where = buildLaundryCountLineWhere({ actor: context.actor });

    const work = await laundryCountLinesRepository.findAccessibleWork({
      workId,
      where,
      client: tx,
    });
    laundryCountLinesBusiness.assertWorkCanAcceptCountLine(work);

    const bag = await laundryCountLinesRepository.findBagById({
      bagId: payload.bagId,
      client: tx,
    });
    if (payload.bagId) {
      laundryCountLinesBusiness.assertBagBelongsToWork({ bag, workId });
      laundryCountLinesBusiness.assertBagCanAcceptCountLine(bag);
    }

    const itemType = await laundryCountLinesRepository.findItemTypeById({
      itemTypeId: payload.itemTypeId,
      client: tx,
    });
    laundryCountLinesBusiness.assertItemTypeCanBeCounted(itemType);

    const createdCountLine = await laundryCountLinesRepository.createLaundryCountLine({
      data: laundryCountLinesBusiness.buildCreateCountLineData({ work, payload }),
      client: tx,
    });

    if (laundryCountLinesBusiness.shouldMoveWorkToItemCounted(work.currentStatus)) {
      const workUpdateResult = await laundryCountLinesRepository.updateWorkAfterCountLine({
        workId: work.id,
        expectedStatus: work.currentStatus,
        client: tx,
      });

      if (workUpdateResult.count === 0) {
        const error = new Error('Laundry Work status changed during count line creation');
        error.statusCode = 409;
        throw error;
      }

      await laundryCountLinesRepository.createWorkStatusLog({
        data: {
          workId: work.id,
          fromStatus: 'BAG_OPENED',
          toStatus: 'ITEM_COUNTED',
          note: 'First count line recorded',
        },
        client: tx,
      });
    }

    return createdCountLine;
  });

  logger.business('laundry.count_line.created', {
    ...buildActorLogContext(context.actor),
    workId: countLine.workId,
    bagId: countLine.bagId,
    countLineId: countLine.id,
    resortId: countLine.resortId,
    itemTypeId: countLine.itemTypeId,
    colorGroup: countLine.colorGroup,
    quantity: countLine.quantity,
    issueQuantity: countLine.issueQuantity,
  });

  return countLine;
};

module.exports = {
  listLaundryCountLines,
  createLaundryCountLine,
};
