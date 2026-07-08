const laundryCountLinesBusiness = require('../domain/laundryCountLines.business');
const laundryCountLinesRepository = require('../repositories/laundryCountLines.repository');
const { normalizePagination } = require('../shared/pagination');

const listLaundryCountLines = async (workId, query = {}) => {
  const { skip, take } = normalizePagination(query);

  const where = {
    ...laundryCountLinesRepository.buildWorkspaceWhere({
      workspaceType: query.workspaceType,
      resortId: query.resortId,
    }),
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

const createLaundryCountLine = async (workId, payload = {}, query = {}) => {
  return laundryCountLinesRepository.transaction(async (tx) => {
    const where = laundryCountLinesRepository.buildWorkspaceWhere({
      workspaceType: query.workspaceType,
      resortId: query.resortId,
    });

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

    const countLine = await laundryCountLinesRepository.createLaundryCountLine({
      data: laundryCountLinesBusiness.buildCreateCountLineData({ work, payload }),
      client: tx,
    });

    if (laundryCountLinesBusiness.shouldMoveWorkToItemCounted(work.currentStatus)) {
      await laundryCountLinesRepository.updateWorkAfterCountLine({
        workId: work.id,
        currentStatus: work.currentStatus,
        client: tx,
      });

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

    return countLine;
  });
};

module.exports = {
  listLaundryCountLines,
  createLaundryCountLine,
};
