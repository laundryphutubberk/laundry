const { getRequestContext } = require('./requestContext');

const buildMeta = (meta) => {
  const context = getRequestContext();
  const requestId = context?.requestId;

  return {
    ...(requestId ? { requestId } : {}),
    ...(meta || {}),
  };
};

const sendSuccess = (res, data = null, meta = undefined, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    meta: buildMeta(meta),
  });
};

const sendFailure = (res, error, statusCode = 500, meta = undefined) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message: error.message,
      statusCode,
    },
    meta: buildMeta(meta),
  });
};

module.exports = {
  sendSuccess,
  sendFailure,
};
