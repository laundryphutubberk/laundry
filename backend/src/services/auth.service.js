const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const { env } = require('../config/env');
const authRepository = require('../repositories/auth.repository');
const { logger } = require('../core/observability');

const createAuthError = () => {
  const error = new Error('Invalid email or password');
  error.statusCode = 401;
  error.code = 'INVALID_CREDENTIALS';
  return error;
};

const createConflictError = (message) => {
  const error = new Error(message);
  error.statusCode = 409;
  error.code = 'AUTH_USER_ALREADY_EXISTS';
  return error;
};

const buildActorPayload = (user) => ({
  userId: user.id,
  role: user.role,
  workspaceType: user.workspaceType,
  resortId: user.resortId,
  active: user.active,
});

const sanitizeUser = (user) => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  role: user.role,
  workspaceType: user.workspaceType,
  resortId: user.resortId,
  active: user.active,
});

const createSession = (user) => {
  const actor = buildActorPayload(user);
  const token = jwt.sign(actor, env.JWT_SECRET, {
    expiresIn: env.AUTH_ACCESS_TOKEN_TTL,
  });

  return {
    token,
    actor,
    user: sanitizeUser(user),
  };
};

const DAY_MS = 24 * 60 * 60 * 1000;
const hashCredential = (credential) => crypto.createHash('sha256').update(credential).digest('hex');
const createCredential = () => crypto.randomBytes(48).toString('base64url');
const createSessionError = (code, message, statusCode = 401) => Object.assign(new Error(message), { code, statusCode });

const createPersistentDeviceSession = async (user, metadata = {}) => {
  const now = new Date();
  const credential = createCredential();
  const record = await authRepository.createDeviceSession({
    userId: user.id,
    familyId: crypto.randomUUID(),
    credentialHash: hashCredential(credential),
    deviceLabel: metadata.deviceLabel || 'Personal device',
    userAgent: metadata.userAgent || null,
    idleExpiresAt: new Date(now.getTime() + env.AUTH_SESSION_IDLE_DAYS * DAY_MS),
    absoluteExpiresAt: new Date(now.getTime() + env.AUTH_SESSION_ABSOLUTE_DAYS * DAY_MS),
  });
  logger.security('auth.session.created', { userId: user.id, sessionId: record.id });
  return { credential: `${record.id}.${credential}`, sessionId: record.id };
};

const parseSessionCredential = (raw) => {
  if (!raw || typeof raw !== 'string') throw createSessionError('AUTH_SESSION_REQUIRED', 'Device session is required');
  const separator = raw.indexOf('.');
  if (separator < 1) throw createSessionError('AUTH_SESSION_INVALID', 'Device session is invalid');
  return { id: raw.slice(0, separator), secret: raw.slice(separator + 1) };
};

const refreshDeviceSession = async (rawCredential) => {
  const { id, secret } = parseSessionCredential(rawCredential);
  const session = await authRepository.findDeviceSessionById(id);
  if (!session || session.revokedAt || !session.user.active) {
    logger.security('auth.session.refresh_failed', { sessionId: id, reason: 'inactive' });
    throw createSessionError('AUTH_SESSION_INVALID', 'Device session is invalid or revoked');
  }
  const now = new Date();
  if (session.idleExpiresAt <= now || session.absoluteExpiresAt <= now) {
    await authRepository.revokeDeviceSession(id, now);
    logger.security('auth.session.refresh_failed', { sessionId: id, reason: 'expired' });
    throw createSessionError('AUTH_SESSION_EXPIRED', 'Device session has expired');
  }
  const presentedHash = hashCredential(secret);
  if (session.previousHash && crypto.timingSafeEqual(Buffer.from(presentedHash), Buffer.from(session.previousHash))) {
    await authRepository.revokeSessionFamily(session.familyId, { revokedAt: now, compromisedAt: now });
    logger.security('auth.session.reuse_detected', { userId: session.userId, sessionId: id });
    throw createSessionError('AUTH_SESSION_REUSE_DETECTED', 'Device session credential reuse detected');
  }
  if (!crypto.timingSafeEqual(Buffer.from(presentedHash), Buffer.from(session.credentialHash))) {
    logger.security('auth.session.refresh_failed', { sessionId: id, reason: 'credential_mismatch' });
    throw createSessionError('AUTH_SESSION_INVALID', 'Device session is invalid');
  }
  const nextSecret = createCredential();
  const rotated = await authRepository.rotateDeviceSession(id, session.credentialHash, {
    previousHash: session.credentialHash,
    credentialHash: hashCredential(nextSecret),
    rotationCounter: { increment: 1 },
    lastUsedAt: now,
    idleExpiresAt: new Date(Math.min(now.getTime() + env.AUTH_SESSION_IDLE_DAYS * DAY_MS, session.absoluteExpiresAt.getTime())),
  });
  if (rotated.count !== 1) {
    await authRepository.revokeSessionFamily(session.familyId, { revokedAt: now, compromisedAt: now });
    logger.security('auth.session.reuse_detected', { userId: session.userId, sessionId: id, reason: 'concurrent_rotation' });
    throw createSessionError('AUTH_SESSION_REUSE_DETECTED', 'Device session credential reuse detected');
  }
  logger.security('auth.session.rotated', { userId: session.userId, sessionId: id });
  return { ...createSession(session.user), credential: `${id}.${nextSecret}`, sessionId: id };
};

const login = async ({ email, password, rememberDevice, deviceLabel }, metadata = {}) => {
  const user = await authRepository.findActiveUserByEmail(email);

  if (!user) {
    throw createAuthError();
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw createAuthError();
  }

  const accessSession = createSession(user);
  if (!rememberDevice) return accessSession;
  const persistent = await createPersistentDeviceSession(user, { ...metadata, deviceLabel });
  return { ...accessSession, ...persistent };
};

const logoutCurrent = async (rawCredential) => {
  if (!rawCredential) return;
  const { id } = parseSessionCredential(rawCredential);
  await authRepository.revokeDeviceSession(id);
  logger.security('auth.logout.current', { sessionId: id });
};

const logoutAll = async (userId) => {
  await authRepository.revokeAllDeviceSessions(userId);
  logger.security('auth.logout.all', { userId });
};

const listSessions = async (userId, currentSessionId) => (await authRepository.listDeviceSessions(userId)).map((item) => ({
  ...item,
  current: item.id === currentSessionId,
}));

const revokeSession = async (userId, sessionId) => {
  const owned = await authRepository.findOwnedDeviceSession(sessionId, userId);
  if (!owned) throw createSessionError('AUTH_SESSION_NOT_FOUND', 'Device session was not found', 404);
  await authRepository.revokeDeviceSession(sessionId);
  logger.security('auth.session.revoked', { userId, sessionId });
};

const register = async ({ email, password, displayName, role, workspaceType, resortId }) => {
  const existingUser = await authRepository.findUserByEmail(email);

  if (existingUser) {
    throw createConflictError('Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await authRepository.createUser({
    email,
    passwordHash,
    displayName,
    role,
    workspaceType,
    resortId,
  });

  return createSession(user);
};

module.exports = {
  login,
  register,
  refreshDeviceSession,
  logoutCurrent,
  logoutAll,
  listSessions,
  revokeSession,
};
