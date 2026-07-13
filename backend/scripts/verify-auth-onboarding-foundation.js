const jwt = require('jsonwebtoken');

const { prisma } = require('../src/core/prisma');
const authRepository = require('../src/repositories/auth.repository');
const authService = require('../src/services/auth.service');
const { normalizeAndAssertActor } = require('../src/core/actor');
const { assertLaundryWorkspaceActor } = require('../src/policies/authorization.policy');
const { env } = require('../src/config/env');

const fail = (message) => { throw new Error(message); };

async function run() {
  const marker = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const email = `onboarding-${marker}@example.test`;
  let userId;
  try {
    const user = await authRepository.createPasswordlessOnboardingUserWithIdentity({
      user: { email, displayName: 'Onboarding User' },
      identity: {
        provider: 'GOOGLE', providerSubject: `subject-${marker}`, providerEmail: email,
        emailVerified: true, displayName: 'Onboarding User', unlinkedAt: null,
      },
    });
    userId = user.id;
    if (user.passwordHash !== null || user.role !== null || user.workspaceType !== null || user.resortId !== null) fail('Onboarding User received legacy authorization or password');
    if (user.onboardingStatus !== 'PENDING') fail('Onboarding status was not PENDING');

    const session = await authService.issueSession(user, false);
    const actor = normalizeAndAssertActor(jwt.verify(session.token, env.JWT_SECRET));
    if (actor.hasBusinessContext !== false || actor.onboardingStatus !== 'PENDING') fail('Onboarding actor contract is invalid');

    const legacyActor = normalizeAndAssertActor({ userId: 7, role: 'LAUNDRY_STAFF', workspaceType: 'LAUNDRY', resortId: null, active: true });
    if (legacyActor.role !== 'LAUNDRY_STAFF' || legacyActor.workspaceType !== 'LAUNDRY' || 'onboardingStatus' in legacyActor || 'hasBusinessContext' in legacyActor) {
      fail('Legacy actor compatibility contract changed');
    }

    let inactiveError;
    try { normalizeAndAssertActor({ ...actor, active: false }); } catch (error) { inactiveError = error; }
    if (inactiveError?.code !== 'INVALID_ACTOR_CONTEXT') fail('Inactive onboarding actor was accepted');

    let operationalError;
    try { assertLaundryWorkspaceActor(actor); } catch (error) { operationalError = error; }
    if (operationalError?.code !== 'ONBOARDING_REQUIRED') fail('Operational access did not fail with ONBOARDING_REQUIRED');

    let passwordError;
    try { await authService.login({ email, password: 'not-a-password' }); } catch (error) { passwordError = error; }
    if (passwordError?.code !== 'INVALID_CREDENTIALS') fail('Passwordless login did not use generic credential failure');

    const invalid = await prisma.user.create({ data: { email: `invalid-${marker}@example.test`, passwordHash: null, role: null, workspaceType: null, onboardingStatus: 'PENDING', active: true } });
    try {
      let invalidError;
      try { await authService.issueSession({ ...invalid, resortId: null }, false); } catch (error) { invalidError = error; }
      if (invalidError?.code !== 'AUTHENTICATION_REQUIRED') fail('Invalid no-method User received a session');
    } finally {
      await prisma.user.delete({ where: { id: invalid.id } });
    }

    const methodCounts = await require('../src/repositories/userIdentity.repository').getUsableMethodCounts(user.id, (await prisma.userIdentity.findFirst({ where: { userId: user.id } })).id);
    if (methodCounts.hasPassword || methodCounts.activeIdentityCount !== 0) {
      fail('Final-method protection inputs are incorrect');
    }
    const identity = await prisma.userIdentity.findFirst({ where: { userId: user.id } });
    const removable = await require('../src/services/userIdentity.service').createUserIdentityService().canRemoveIdentity(user.id, identity.id);
    if (removable) fail('Final usable identity was reported removable');

    console.log('AUTH_ONBOARDING_FOUNDATION_VERIFY=PASS');
  } finally {
    if (userId) await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    await prisma.$disconnect();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
