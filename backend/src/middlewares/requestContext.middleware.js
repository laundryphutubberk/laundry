const requestContextMiddleware = (req, _res, next) => {
  req.context = {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
  };

  next();
};

module.exports = {
  requestContextMiddleware,
};
