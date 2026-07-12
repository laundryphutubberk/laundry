const assert = require('assert/strict');
const bcrypt = require('bcrypt');
const { prisma } = require('../src/core/prisma');
const userIdentityRepository = require('../src/repositories/userIdentity.repository');
const { createUserIdentityService } = require('../src/services/userIdentity.service');

const verifiedIdentity = (providerSubject, overrides = {}) => ({
  provider: 'GOOGLE',
  providerSubject,
  verifiedEmail: 'shared-provider@example.test',
  emailVerified: true,
  displayName: 'Provider Snapshot',
  avatarUrl: 'https://example.test/avatar.png',
  ...overrides,
});

async function main() {
  const marker = Date.now();
  const resort = await prisma.resort.create({ data: { name: `Identity Verification ${marker}` } });
  const passwordHash = await bcrypt.hash('identity-verification-password', 12);
  const firstUser = await prisma.user.create({ data: {
    email: `identity-first-${marker}@example.test`,
    passwordHash,
    displayName: 'First Identity User',
    role: 'LAUNDRY_MANAGER',
    workspaceType: 'LAUNDRY',
    active: true,
  } });
  const secondUser = await prisma.user.create({ data: {
    email: `identity-second-${marker}@example.test`,
    passwordHash,
    displayName: 'Second Identity User',
    role: 'RESORT_STAFF',
    workspaceType: 'RESORT',
    resortId: resort.id,
    active: true,
  } });
  const service = createUserIdentityService();

  try {
    const authorizationBefore = await prisma.user.findMany({
      where: { id: { in: [firstUser.id, secondUser.id] } },
      orderBy: { id: 'asc' },
      select: { id: true, role: true, workspaceType: true, resortId: true, active: true },
    });

    const first = await service.createForSelectedUser(firstUser.id, verifiedIdentity(`subject-${marker}-one`));
    assert.equal(first.userId, firstUser.id);
    assert.equal((await service.findActive('GOOGLE', first.providerSubject)).id, first.id);
    await assert.rejects(
      () => service.createForSelectedUser(firstUser.id, verifiedIdentity(first.providerSubject)),
      (error) => error.code === 'IDENTITY_ALREADY_LINKED' && error.statusCode === 409,
    );
    await assert.rejects(
      () => service.createForSelectedUser(secondUser.id, verifiedIdentity(first.providerSubject)),
      (error) => error.code === 'IDENTITY_CONFLICT' && error.statusCode === 409,
    );

    const secondForFirst = await service.createForSelectedUser(firstUser.id, verifiedIdentity(`subject-${marker}-two`));
    assert.equal(secondForFirst.userId, firstUser.id);
    assert.equal((await service.listForUser(firstUser.id)).length, 2);

    const sameEmailOtherSubject = await service.createForSelectedUser(secondUser.id, verifiedIdentity(`subject-${marker}-three`));
    assert.equal(sameEmailOtherSubject.userId, secondUser.id);
    assert.equal(sameEmailOtherSubject.providerEmail, first.providerEmail);

    const updated = await service.updateVerifiedSnapshots(verifiedIdentity(first.providerSubject, {
      verifiedEmail: 'changed-provider@example.test',
      displayName: 'Updated Snapshot',
    }));
    assert.equal(updated.id, first.id);
    assert.equal(updated.userId, firstUser.id);
    assert.equal(updated.providerEmail, 'changed-provider@example.test');

    const candidate = await service.findUserCandidateByVerifiedEmail(verifiedIdentity('candidate', { verifiedEmail: firstUser.email }));
    assert.equal(candidate.id, firstUser.id);
    assert.equal(await service.findUserCandidateByVerifiedEmail(verifiedIdentity('candidate', { emailVerified: false })), null);
    assert.equal(await service.canRemoveIdentity(firstUser.id, first.id), true);

    await userIdentityRepository.markUnlinked(first.id);
    await assert.rejects(() => service.findActive('GOOGLE', first.providerSubject), (error) => error.code === 'IDENTITY_REVOKED');

    const authorizationAfter = await prisma.user.findMany({
      where: { id: { in: [firstUser.id, secondUser.id] } },
      orderBy: { id: 'asc' },
      select: { id: true, role: true, workspaceType: true, resortId: true, active: true },
    });
    assert.deepEqual(authorizationAfter, authorizationBefore);

    const persisted = await prisma.userIdentity.findMany({ where: { userId: { in: [firstUser.id, secondUser.id] } } });
    assert.ok(persisted.length >= 3);
    for (const identity of persisted) {
      assert.equal('token' in identity, false);
      assert.equal('credential' in identity, false);
      assert.equal('role' in identity, false);
      assert.equal('workspaceType' in identity, false);
      assert.equal('resortId' in identity, false);
    }

    await prisma.user.delete({ where: { id: firstUser.id } });
    assert.equal(await prisma.userIdentity.count({ where: { userId: firstUser.id } }), 0);
    console.log('AUTH_USER_IDENTITY_DB_VERIFY=PASS');
  } finally {
    await prisma.user.deleteMany({ where: { id: { in: [firstUser.id, secondUser.id] } } }).catch(() => {});
    await prisma.resort.delete({ where: { id: resort.id } }).catch(() => {});
    await prisma.$disconnect();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
