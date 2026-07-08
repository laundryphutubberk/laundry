const assert = require('assert/strict');

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://verify:verify@localhost:5432/laundry_verify';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'verify-policy-jwt-secret-at-least-32-chars';
process.env.ENABLE_DEV_ACTOR_HEADER = process.env.ENABLE_DEV_ACTOR_HEADER || 'false';

const {
  USER_ROLES,
  WORKSPACE_TYPES,
  normalizeActor,
  assertValidActor,
  normalizeAndAssertActor,
} = require('../src/core/actor');
const {
  buildRequiredActorResortScopedWhere,
  buildResortScopedWhere,
  getRequiredActorWorkspaceScope,
} = require('../src/policies/workspace.policy');
const {
  assertLaundryManagementActor,
  assertLaundryStaffActor,
  assertLaundryWorkspaceActor,
} = require('../src/policies/authorization.policy');

const assertThrowsWithCode = (fn, code) => {
  assert.throws(fn, (error) => {
    assert.equal(error.code, code);
    assert.equal(typeof error.statusCode, 'number');
    return true;
  });
};

const laundryStaffActor = Object.freeze({
  userId: 1,
  role: USER_ROLES.LAUNDRY_STAFF,
  workspaceType: WORKSPACE_TYPES.LAUNDRY,
  resortId: null,
  active: true,
});

const laundryManagerActor = Object.freeze({
  userId: 2,
  role: USER_ROLES.LAUNDRY_MANAGER,
  workspaceType: WORKSPACE_TYPES.LAUNDRY,
  resortId: null,
  active: true,
});

const resortStaffActor = Object.freeze({
  userId: 3,
  role: USER_ROLES.RESORT_STAFF,
  workspaceType: WORKSPACE_TYPES.RESORT,
  resortId: 10,
  active: true,
});

const runActorPolicyTests = () => {
  assert.deepEqual(
    normalizeActor({ id: '7', role: USER_ROLES.LAUNDRY_OWNER, workspaceType: WORKSPACE_TYPES.LAUNDRY, active: true }),
    {
      userId: 7,
      role: USER_ROLES.LAUNDRY_OWNER,
      workspaceType: WORKSPACE_TYPES.LAUNDRY,
      resortId: null,
      active: true,
    },
  );

  assert.equal(assertValidActor(laundryStaffActor), laundryStaffActor);
  assert.equal(normalizeAndAssertActor({ ...resortStaffActor, userId: '3', resortId: '10' }).resortId, 10);

  assertThrowsWithCode(() => assertValidActor(null), 'INVALID_ACTOR_CONTEXT');
  assertThrowsWithCode(() => assertValidActor({ ...laundryStaffActor, userId: null }), 'INVALID_ACTOR_CONTEXT');
  assertThrowsWithCode(() => assertValidActor({ ...laundryStaffActor, role: 'UNKNOWN' }), 'INVALID_ACTOR_CONTEXT');
  assertThrowsWithCode(() => assertValidActor({ ...laundryStaffActor, active: false }), 'INVALID_ACTOR_CONTEXT');
  assertThrowsWithCode(
    () => assertValidActor({ ...resortStaffActor, resortId: null }),
    'INVALID_ACTOR_CONTEXT',
  );
};

const runWorkspacePolicyTests = () => {
  assert.deepEqual(getRequiredActorWorkspaceScope(laundryStaffActor), {
    workspaceType: WORKSPACE_TYPES.LAUNDRY,
    resortId: null,
  });

  assert.deepEqual(buildRequiredActorResortScopedWhere({ actor: laundryStaffActor }), {});
  assert.deepEqual(buildRequiredActorResortScopedWhere({ actor: resortStaffActor }), { resortId: 10 });

  assert.deepEqual(
    buildResortScopedWhere({
      actor: null,
      workspaceType: WORKSPACE_TYPES.RESORT,
      resortId: 11,
    }),
    { resortId: 11 },
  );

  assertThrowsWithCode(
    () => buildRequiredActorResortScopedWhere({ actor: { ...resortStaffActor, resortId: null } }),
    'INVALID_ACTOR_CONTEXT',
  );
};

const runAuthorizationPolicyTests = () => {
  assert.equal(assertLaundryWorkspaceActor(laundryStaffActor), laundryStaffActor);
  assert.equal(assertLaundryStaffActor(laundryStaffActor), laundryStaffActor);
  assert.equal(assertLaundryStaffActor(laundryManagerActor), laundryManagerActor);
  assert.equal(assertLaundryManagementActor(laundryManagerActor), laundryManagerActor);

  assertThrowsWithCode(() => assertLaundryWorkspaceActor(resortStaffActor), 'AUTHORIZATION_POLICY_VIOLATION');
  assertThrowsWithCode(() => assertLaundryStaffActor(resortStaffActor), 'AUTHORIZATION_POLICY_VIOLATION');
  assertThrowsWithCode(() => assertLaundryManagementActor(laundryStaffActor), 'AUTHORIZATION_POLICY_VIOLATION');
};

runActorPolicyTests();
runWorkspacePolicyTests();
runAuthorizationPolicyTests();

console.log('BE-07 policy verification tests passed.');
