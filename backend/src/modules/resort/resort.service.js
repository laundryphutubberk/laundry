const resortsBusiness = require('./resort.business');
const resortsRepository = require('./resort.repository');
const {
  assertLaundryManagementActor,
  assertLaundryStaffActor,
} = require('../../policies/authorization.policy');
const { normalizePagination } = require('../../shared/pagination');

const listResorts = async (query = {}, context = {}) => {
  assertLaundryStaffActor(context.actor);

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

const createResort = async (payload = {}, context = {}) => {
  assertLaundryManagementActor(context.actor);

  return resortsRepository.transaction(async (tx) => {
    return resortsRepository.createResort({
      data: resortsBusiness.buildCreateResortData(payload),
      client: tx,
    });
  });
};

const updateResort = async (resortId, payload = {}, context = {}) => {
  assertLaundryManagementActor(context.actor);

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
