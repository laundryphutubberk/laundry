const { runWithRequestContext } = require('../core/requestContext');

const requestContextMiddleware = (req, _res, next) => {
  const context = {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl
  };

  req.context = context;

  runWithRequestContext(context, function runNext() {
    next();
  });
};

module.exports = {
  requestContextMiddleware,
};
