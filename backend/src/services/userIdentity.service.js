const userIdentityRepository = require('../repositories/userIdentity.repository');

const createIdentityError = (code, message, statusCode) => Object.assign(new Error(message), { code, statusCode });

const normalizeSnapshot = (verifiedIdentity) => ({
  providerEmail: verifiedIdentity.verifiedEmail?.toLowerCase() || null,
  emailVerified: verifiedIdentity.emailVerified === true,
  displayName: verifiedIdentity.displayName || null,
  avatarUrl: verifiedIdentity.avatarUrl || null,
});

const createUserIdentityService = ({ repository = userIdentityRepository } = {}) => {
  const findActive = async (provider, providerSubject) => {
    const identity = await repository.findByProviderSubject(provider, providerSubject);
    if (!identity) throw createIdentityError('IDENTITY_NOT_FOUND', 'Provider identity was not found', 404);
    if (identity.unlinkedAt) throw createIdentityError('IDENTITY_REVOKED', 'Provider identity is unlinked', 401);
    return identity;
  };

  return {
  async createForSelectedUser(userId, verifiedIdentity) {
    const existing = await repository.findByProviderSubject(verifiedIdentity.provider, verifiedIdentity.providerSubject);
    if (existing) {
      if (existing.userId !== userId) throw createIdentityError('IDENTITY_CONFLICT', 'Provider identity belongs to another User', 409);
      if (existing.unlinkedAt) throw createIdentityError('IDENTITY_REVOKED', 'Provider identity was previously unlinked', 409);
      throw createIdentityError('IDENTITY_ALREADY_LINKED', 'Provider identity is already linked to this User', 409);
    }

    try {
      return await repository.createIdentity({
        userId,
        provider: verifiedIdentity.provider,
        providerSubject: verifiedIdentity.providerSubject,
        ...normalizeSnapshot(verifiedIdentity),
      });
    } catch (error) {
      if (error?.code === 'P2002') throw createIdentityError('IDENTITY_CONFLICT', 'Provider identity is already linked', 409);
      throw error;
    }
  },

  findActive,

  async updateVerifiedSnapshots(verifiedIdentity) {
    const identity = await findActive(verifiedIdentity.provider, verifiedIdentity.providerSubject);
    return repository.updateSnapshots(identity.id, {
      ...normalizeSnapshot(verifiedIdentity),
      lastUsedAt: new Date(),
    });
  },

  listForUser(userId) {
    return repository.listForUser(userId);
  },

  findUserCandidateByVerifiedEmail(verifiedIdentity) {
    if (!verifiedIdentity.emailVerified || !verifiedIdentity.verifiedEmail) return null;
    return repository.findUserByVerifiedEmail(verifiedIdentity.verifiedEmail);
  },

  async canRemoveIdentity(userId, identityId) {
    const methods = await repository.getUsableMethodCounts(userId, identityId);
    return methods.hasPassword || methods.activeIdentityCount > 0;
  },
  };
};

module.exports = {
  createIdentityError,
  createUserIdentityService,
};
