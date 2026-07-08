const { sendFailure } = require('../core/httpResponse');

const buildErrorMeta = (error) => {
  const meta = {};

  if (error.code) {
    meta.code = error.code;
  }

  if (error.details) {
    meta.details = error.details;
  }

  return Object.keys(meta).length > 0 ? meta : undefined;
};

const errorMiddleware = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : error.message;
  const meta = statusCode === 500 ? undefined : buildErrorMeta(error);

  return sendFailure(res, { message }, statusCode, meta);
};

module.exports = {
  errorMiddleware,
};
