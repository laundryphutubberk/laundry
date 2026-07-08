const { USER_ROLES, WORKSPACE_TYPES, assertValidActor } = require('../core/actor');

const LAUNDRY_STAFF_ROLES = new Set([
  USER_ROLES.LAUNDRY_OWNER,
  USER_ROLES.LAUNDRY_MANAGER,
  USER_ROLES.LAUNDRY_STAFF,
]);

const LAUNDRY_MANAGEMENT_ROLES = new Set([
  USER_ROLES.LAUNDRY_OWNER,
  USER_ROLES.LAUNDRY_MANAGER,
]);

const createAuthorizationError = (message) => {
  const error = new Error(message);
  error.statusCode = 403;
  error.code = 'AUTHORIZATION_POLICY_VIOLATION';
  return error;
};

const assertLaundryWorkspaceActor = (actor) => {
  const validActor = assertValidActor(actor);

  if (validActor.workspaceType !== WORKSPACE_TYPES.LAUNDRY) {
    throw createAuthorizationError('Laundry workspace actor is required');
  }

  return validActor;
};

const assertLaundryStaffActor = (actor) => {
  const validActor = assertLaundryWorkspaceActor(actor);

  if (!LAUNDRY_STAFF_ROLES.has(validActor.role)) {
    throw createAuthorizationError('Laundry staff authorization is required');
  }

  return validActor;
};

const assertLaundryManagementActor = (actor) => {
  const validActor = assertLaundryWorkspaceActor(actor);

  if (!LAUNDRY_MANAGEMENT_ROLES.has(validActor.role)) {
    throw createAuthorizationError('Laundry management authorization is required');
  }

  return validActor;
};

module.exports = {
  assertLaundryWorkspaceActor,
  assertLaundryStaffActor,
  assertLaundryManagementActor,
};
