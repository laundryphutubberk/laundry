const resortsBusiness = require('../domain/resorts.business');
const resortsRepository = require('../repositories/resorts.repository');
const { normalizePagination } = require('../shared/pagination');

const listResorts = async (query = {}) => {
  const { skip, take } = normalizePagination(query);
  const where = {};

  if (query.active !== undefined) {
    where.active = query.active === 'true' || query.active === true;
  }

  const result = await resortsRepository.listResorts({
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

const createResort = async (payload = {}) => {
  return resortsRepository.transaction(async (tx) => {
    return resortsRepository.createResort({
      data: resortsBusiness.buildCreateResortData(payload),
      client: tx,
    });
  });
};

const updateResort = async (resortId, payload = {}) => {
  return resortsRepository.transaction(async (tx) => {
    const currentResort = await resortsRepository.findResortById({
      resortId,
      client: tx,
    });

    resortsBusiness.assertResortExists(currentResort);

    if (resortsBusiness.isDeactivationRequested({ currentResort, payload })) {
      const activeWorkCount = await resortsRepository.countActiveWorksByResort({
        resortId: currentResort.id,
        client: tx,
      });

      resortsBusiness.assertResortCanBeDeactivated({ activeWorkCount });
    }

    return resortsRepository.updateResort({
      resortId: currentResort.id,
      data: resortsBusiness.buildUpdateResortData({ currentResort, payload }),
      client: tx,
    });
  });
};

module.exports = {
  listResorts,
  createResort,
  updateResort,
};
