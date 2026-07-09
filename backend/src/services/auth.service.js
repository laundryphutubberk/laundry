const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { env } = require('../config/env');
const authRepository = require('../repositories/auth.repository');

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
    expiresIn: '12h',
  });

  return {
    token,
    actor,
    user: sanitizeUser(user),
  };
};

const login = async ({ email, password }) => {
  const user = await authRepository.findActiveUserByEmail(email);

  if (!user) {
    throw createAuthError();
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw createAuthError();
  }

  return createSession(user);
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
};
