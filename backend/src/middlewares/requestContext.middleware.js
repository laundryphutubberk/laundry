const { runWithRequestContext } = require('../core/requestContext');
const { normalizePath } = require('../core/observability');

const requestContextMiddleware = (req, _res, next) => {
  const context = {
    requestId: req.requestId,
    correlationId: req.correlationId,
    method: req.method,
    path: normalizePath(req.originalUrl),
  };

  req.context = context;

  runWithRequestContext(context, function runNext() {
    next();
  });
};

module.exports = {
  requestContextMiddleware,
};
