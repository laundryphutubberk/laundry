const { normalizeAndAssertActor } = require('../core/actor');
const { setActorOnRequest } = require('./authActor.middleware');
const { env } = require('../config/env');

const parseActorHeader = (rawActor) => {
  if (!rawActor) {
    return null;
  }

  try {
    return normalizeAndAssertActor(JSON.parse(rawActor));
  } catch (_error) {
    return null;
  }
};

const optionalActorMiddleware = (req, _res, next) => {
  if (!env.ENABLE_DEV_ACTOR_HEADER || req.context?.actor) {
    return next();
  }

  const actor = parseActorHeader(req.headers['x-dev-actor']);

  if (actor) {
    setActorOnRequest(req, actor);
  }

  return next();
};

module.exports = {
  optionalActorMiddleware,
  parseActorHeader,
};
