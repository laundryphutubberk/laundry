const linenMovementsBusiness = require('../domain/linenMovements.business');
const linenMovementsRepository = require('../repositories/linenMovements.repository');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');
const { normalizePagination } = require('../shared/pagination');

const buildLinenMovementWhere = ({ actor, movementType } = {}) => {
  const where = buildRequiredActorResortScopedWhere({ actor });

  if (movementType) {
    where.movementType = movementType;
  }

  return where;
};

const listLinenMovements = async (query = {}, context = {}) => {
  const { skip, take } = normalizePagination(query);

  const where = buildLinenMovementWhere({
    actor: context.actor,
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

const createLinenMovement = async (payload = {}, context = {}) => {
  return linenMovementsRepository.transaction(async (tx) => {
    const where = buildRequiredActorResortScopedWhere({ actor: context.actor });

    const work = await linenMovementsRepository.findAccessibleWork({
      workId: payload.workId,
      where,
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
