const linenMovementsBusiness = require('./linen-movement.business');
const linenMovementsRepository = require('./linen-movement.repository');
const { normalizePagination } = require('../../shared/pagination');

const listLinenMovements = async (query = {}) => {
  const { skip, take } = normalizePagination(query);

  const where = linenMovementsRepository.buildWorkspaceWhere({
    workspaceType: query.workspaceType,
    resortId: query.resortId,
    movementType: query.movementType,
  });

  const result = await linenMovementsRepository.listLinenMovements({
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

const createLinenMovement = async (payload = {}) => {
  return linenMovementsRepository.transaction(async (tx) => {
    const work = await linenMovementsRepository.findWorkById({
      workId: payload.workId,
      client: tx,
    });
    linenMovementsBusiness.assertWorkCanCreateMovement(work);
    linenMovementsBusiness.assertMovementMatchesWork({ work, payload });

    const itemType = await linenMovementsRepository.findItemTypeById({
      itemTypeId: payload.itemTypeId,
      client: tx,
    });
    linenMovementsBusiness.assertItemTypeCanMove(itemType);

    return linenMovementsRepository.createLinenMovement({
      data: linenMovementsBusiness.buildCreateMovementData(payload),
      client: tx,
    });
  });
};

module.exports = {
  listLinenMovements,
  createLinenMovement,
};
