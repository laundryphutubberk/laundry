const { sendFailure } = require('../core/httpResponse');

const errorMiddleware = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;
  const meta = error.details ? { details: error.details } : undefined;

  return sendFailure(res, { message }, statusCode, meta);
};

module.exports = {
  errorMiddleware,
};
