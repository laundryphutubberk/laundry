const { normalizeActor } = require('../core/actor');
const { setRequestActor } = require('../core/requestContext');

const parseActorHeader = (rawActor) => {
  if (!rawActor) {
    return null;
  }

  try {
    return normalizeActor(JSON.parse(rawActor));
  } catch (_error) {
    return null;
  }
};

const optionalActorMiddleware = (req, _res, next) => {
  const actor = parseActorHeader(req.headers['x-dev-actor']);

  if (actor) {
    req.context = req.context || {};
    req.context.actor = actor;
    setRequestActor(actor);
  }

  return next();
};

module.exports = {
  optionalActorMiddleware,
  parseActorHeader,
};
