const { USER_ROLES, WORKSPACE_TYPES, assertValidActor } = require('../core/actor');

const createAuthorizationError = (message, statusCode = 403) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = 'AUTHORIZATION_POLICY_VIOLATION';
  return error;
};

const LAUNDRY_MANAGEMENT_ROLES = Object.freeze([
  USER_ROLES.LAUNDRY_OWNER,
  USER_ROLES.LAUNDRY_MANAGER,
]);

const LAUNDRY_STAFF_ROLES = Object.freeze([
  USER_ROLES.LAUNDRY_OWNER,
  USER_ROLES.LAUNDRY_MANAGER,
  USER_ROLES.LAUNDRY_STAFF,
]);

const assertLaundryWorkspaceActor = (actor) => {
  const validActor = assertValidActor(actor);

  if (validActor.onboardingStatus === 'PENDING' || validActor.hasBusinessContext === false) {
    throw Object.assign(new Error('Onboarding is required before operational access'), { statusCode: 403, code: 'ONBOARDING_REQUIRED' });
  }

  if (validActor.workspaceType !== WORKSPACE_TYPES.LAUNDRY) {
    throw createAuthorizationError('Laundry workspace access is required');
  }

  return validActor;
};

const assertLaundryManagementActor = (actor) => {
  const validActor = assertLaundryWorkspaceActor(actor);

  if (!LAUNDRY_MANAGEMENT_ROLES.includes(validActor.role)) {
    throw createAuthorizationError('Laundry management permission is required');
  }

  return validActor;
};

const assertLaundryStaffActor = (actor) => {
  const validActor = assertLaundryWorkspaceActor(actor);

  if (!LAUNDRY_STAFF_ROLES.includes(validActor.role)) {
    throw createAuthorizationError('Laundry staff permission is required');
  }

  return validActor;
};

module.exports = {
  LAUNDRY_MANAGEMENT_ROLES,
  LAUNDRY_STAFF_ROLES,
  assertLaundryWorkspaceActor,
  assertLaundryManagementActor,
  assertLaundryStaffActor,
};
