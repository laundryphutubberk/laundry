const repository = require('../repositories/laundryItemTypes.repository');
const { assertLaundryStaffActor } = require('../policies/authorization.policy');

const listActiveLaundryItemTypes = async (_query = {}, context = {}) => {
  assertLaundryStaffActor(context.actor);
  return repository.listActiveLaundryItemTypes();
};

module.exports = { listActiveLaundryItemTypes };
