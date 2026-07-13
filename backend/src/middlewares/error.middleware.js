const { sendFailure } = require('../core/httpResponse');
const { incrementCounter, logger } = require('../core/observability');

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

const errorMiddleware = (error, req, res, _next) => {
  const isRequestValidationError = error?.name === 'ZodError' && Array.isArray(error.issues);
  const statusCode = isRequestValidationError ? 400 : (error.statusCode || 500);
  const message = isRequestValidationError
    ? 'Invalid request payload'
    : (statusCode === 500 ? 'Internal server error' : error.message);
  const meta = isRequestValidationError
    ? { code: 'VALIDATION_ERROR' }
    : (statusCode === 500 ? undefined : buildErrorMeta(error));
  const statusFamily = `${Math.floor(statusCode / 100)}xx`;

  incrementCounter('app_errors_total', {
    status: statusFamily,
    name: error.name || 'Error',
  });

  logger.error('http.error', {
    method: req.method,
    path: req.originalUrl,
    statusCode,
    errorName: error.name || 'Error',
    errorCode: error.code,
    message,
    stack: process.env.NODE_ENV === 'production' || isRequestValidationError ? undefined : error.stack,
  });

  return sendFailure(res, { message }, statusCode, meta);
};

module.exports = {
  errorMiddleware,
};
