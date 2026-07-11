const laundryCountLinesBusiness = require('../domain/laundryCountLines.business');
const laundryCountLinesRepository = require('../repositories/laundryCountLines.repository');
const { logger } = require('../core/observability');
const { assertLaundryStaffActor } = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');
const { normalizePagination } = require('../shared/pagination');

const buildLaundryCountLineWhere = ({ actor } = {}) => buildRequiredActorResortScopedWhere({ actor });

const buildActorLogContext = (actor) => ({
  actorId: actor?.userId,
  actorRole: actor?.role,
  workspaceType: actor?.workspaceType,
  actorResortId: actor?.resortId,
});

const listLaundryCountLines = async (workId, query = {}, context = {}) => {
  const { skip, take } = normalizePagination(query);

  const where = {
    ...buildLaundryCountLineWhere({ actor: context.actor }),
    workId: Number(workId),
    ...(query.bagId ? { bagId: Number(query.bagId) } : {}),
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
  const actor = assertLaundryStaffActor(context.actor);

  const countLine = await laundryCountLinesRepository.transaction(async (tx) => {
    const where = buildLaundryCountLineWhere({ actor: context.actor });

    const work = await laundryCountLinesRepository.findAccessibleWork({
      workId,
      where,
      client: tx,
    });
    laundryCountLinesBusiness.assertWorkCountingIsOpen(work);

    const bag = await laundryCountLinesRepository.findBagById({
      bagId: payload.bagId,
      client: tx,
    });
    laundryCountLinesBusiness.assertBagBelongsToWork({ bag, workId });
    laundryCountLinesBusiness.assertBagCanAcceptCountLine(bag);

    const itemType = await laundryCountLinesRepository.resolveItemType({
      itemTypeId: payload.itemTypeId,
      client: tx,
    });
    laundryCountLinesBusiness.assertItemTypeCanBeCounted(itemType);

    const colorGroup = laundryCountLinesBusiness.normalizeColorGroup(payload.colorGroup);
    await laundryCountLinesRepository.lockCountLineDimension({
      workId: work.id,
      bagId: bag.id,
      itemTypeId: itemType.id,
      colorGroup,
      client: tx,
    });
    const duplicate = await laundryCountLinesRepository.findDuplicateCountLine({
      workId: work.id,
      bagId: bag.id,
      itemTypeId: itemType.id,
      colorGroup,
      client: tx,
    });
    laundryCountLinesBusiness.assertUniqueCountDimension(duplicate);

    const createdCountLine = await laundryCountLinesRepository.createLaundryCountLine({
      data: laundryCountLinesBusiness.buildCreateCountLineData({
        work,
        payload: { ...payload, colorGroup },
        itemType,
      }),
      client: tx,
    });

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

const updateLaundryCountLine = async (lineId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);

  const countLine = await laundryCountLinesRepository.transaction(async (tx) => {
    const where = buildLaundryCountLineWhere({ actor: context.actor });
    const existingCountLine = await laundryCountLinesRepository.findLaundryCountLineById({
      lineId,
      where,
      client: tx,
    });

    if (!existingCountLine) {
      const error = new Error('Laundry Count Line not found');
      error.statusCode = 404;
      throw error;
    }

    const work = await laundryCountLinesRepository.findAccessibleWork({
      workId: existingCountLine.workId,
      where,
      client: tx,
    });
    laundryCountLinesBusiness.assertCountLineUpdateAllowed(work, payload);
    laundryCountLinesBusiness.assertUpdatedCountQuantities({ currentLine: existingCountLine, payload });

    const targetBagId = payload.bagId || existingCountLine.bagId;
    const bag = await laundryCountLinesRepository.findBagById({
      bagId: targetBagId,
      client: tx,
    });
    laundryCountLinesBusiness.assertBagBelongsToWork({ bag, workId: existingCountLine.workId });
    laundryCountLinesBusiness.assertBagCanAcceptCountLine(bag);

    const itemType = payload.itemTypeId
      ? await laundryCountLinesRepository.resolveItemType({
          itemTypeId: payload.itemTypeId,
          client: tx,
        })
      : null;
    if (itemType) laundryCountLinesBusiness.assertItemTypeCanBeCounted(itemType);

    const targetItemTypeId = itemType?.id || existingCountLine.itemTypeId;
    const targetColor = laundryCountLinesBusiness.normalizeColorGroup(
      payload.colorGroup === undefined ? existingCountLine.colorGroup : payload.colorGroup,
    );
    await laundryCountLinesRepository.lockCountLineDimension({
      workId: existingCountLine.workId,
      bagId: bag.id,
      itemTypeId: targetItemTypeId,
      colorGroup: targetColor,
      client: tx,
    });
    const duplicate = await laundryCountLinesRepository.findDuplicateCountLine({
      workId: existingCountLine.workId,
      bagId: bag.id,
      itemTypeId: targetItemTypeId,
      colorGroup: targetColor,
      excludeLineId: existingCountLine.id,
      client: tx,
    });
    laundryCountLinesBusiness.assertUniqueCountDimension(duplicate);

    const updatedCountLine = await laundryCountLinesRepository.updateLaundryCountLine({
      lineId,
      data: laundryCountLinesBusiness.buildUpdateCountLineData({
        payload: { ...payload, bagId: targetBagId, colorGroup: targetColor },
        itemType,
      }),
      client: tx,
    });

    return updatedCountLine;
  });

  logger.business('laundry.count_line.updated', {
    ...buildActorLogContext(context.actor),
    workId: countLine.workId,
    bagId: countLine.bagId,
    countLineId: countLine.id,
    resortId: countLine.resortId,
  });

  return countLine;
};

const deleteLaundryCountLine = async (lineId, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);

  const result = await laundryCountLinesRepository.transaction(async (tx) => {
    const where = buildLaundryCountLineWhere({ actor: context.actor });
    const existingCountLine = await laundryCountLinesRepository.findLaundryCountLineById({
      lineId,
      where,
      client: tx,
    });

    if (!existingCountLine) {
      const error = new Error('Laundry Count Line not found');
      error.statusCode = 404;
      throw error;
    }

    const work = await laundryCountLinesRepository.findAccessibleWork({
      workId: existingCountLine.workId,
      where,
      client: tx,
    });
    laundryCountLinesBusiness.assertWorkCountingIsOpen(work);

    return laundryCountLinesRepository.deleteLaundryCountLine({
      lineId,
      client: tx,
    });
  });

  logger.business('laundry.count_line.deleted', {
    ...buildActorLogContext(context.actor),
    countLineId: lineId,
  });

  return result;
};

const completeLaundryCounting = async (workId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const completedWork = await laundryCountLinesRepository.transaction(async (tx) => {
    const where = buildLaundryCountLineWhere({ actor });
    const work = await laundryCountLinesRepository.findAccessibleWork({ workId, where, client: tx });
    laundryCountLinesBusiness.assertWorkCountingIsOpen(work);
    const bags = await laundryCountLinesRepository.listBagsForCountingCompletion({ workId: work.id, client: tx });
    laundryCountLinesBusiness.assertCountingCanComplete(bags);
    const updatedWork = await laundryCountLinesRepository.completeCounting({
      workId: work.id,
      expectedStatus: 'BAG_OPENED',
      client: tx,
    });
    if (!updatedWork) {
      const error = new Error('Laundry Work status changed during counting completion');
      error.statusCode = 409;
      throw error;
    }
    await laundryCountLinesRepository.createWorkStatusLog({
      data: {
        workId: work.id,
        fromStatus: 'BAG_OPENED',
        toStatus: 'ITEM_COUNTED',
        changedById: actor.userId,
        note: payload.note || 'Counting completed',
      },
      client: tx,
    });
    return updatedWork;
  });
  logger.business('laundry.counting.completed', {
    ...buildActorLogContext(actor),
    workId: completedWork.id,
    resortId: completedWork.resortId,
  });
  return completedWork;
};

module.exports = {
  listLaundryCountLines,
  createLaundryCountLine,
  updateLaundryCountLine,
  deleteLaundryCountLine,
  completeLaundryCounting,
};
