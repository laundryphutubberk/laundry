const { setRequestActor } = require('../core/requestContext');

const parseActorHeader = (rawActor) => {
  if (!rawActor) {
    return null;
  }

  try {
    const actor = JSON.parse(rawActor);

    if (!actor || typeof actor !== 'object') {
      return null;
    }

    return {
      userId: actor.userId || null,
      role: actor.role || null,
      workspaceType: actor.workspaceType || null,
      resortId: actor.resortId || null,
      active: actor.active !== undefined ? Boolean(actor.active) : null,
    };
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
