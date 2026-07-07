const { sendFailure } = require('../core/httpResponse');

const errorMiddleware = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;

  return sendFailure(res, { message }, statusCode);
};

module.exports = {
  errorMiddleware,
};
