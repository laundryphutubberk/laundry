const crypto = require('crypto');

const getHeaderValue = (value) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const requestIdMiddleware = (req, res, next) => {
  const requestId = getHeaderValue(req.headers['x-request-id']) || crypto.randomUUID();
  const correlationId = getHeaderValue(req.headers['x-correlation-id']) || requestId;

  req.requestId = requestId;
  req.correlationId = correlationId;

  res.setHeader('x-request-id', requestId);
  res.setHeader('x-correlation-id', correlationId);

  next();
};

module.exports = {
  requestIdMiddleware,
};
