const jwt = require('jsonwebtoken');

const { normalizeAndAssertActor } = require('../core/actor');
const { setRequestActor } = require('../core/requestContext');
const { env } = require('../config/env');

const createAuthError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = 'AUTHENTICATION_REQUIRED';
  return error;
};

const getBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const setActorOnRequest = (req, actor) => {
  req.context = req.context || {};
  req.context.actor = actor;
  req.actor = actor;
  setRequestActor(actor);
};

const authActorMiddleware = (req, _res, next) => {
  try {
    const token = getBearerToken(req.headers.authorization);

    if (!token) {
      throw createAuthError('Bearer token is required');
    }

    const payload = jwt.verify(token, env.JWT_SECRET);
    const actor = normalizeAndAssertActor(payload);

    setActorOnRequest(req, actor);

    return next();
  } catch (error) {
    if (!error.statusCode) {
      return next(createAuthError('Invalid bearer token'));
    }

    return next(error);
  }
};

module.exports = {
  authActorMiddleware,
  getBearerToken,
  setActorOnRequest,
};
