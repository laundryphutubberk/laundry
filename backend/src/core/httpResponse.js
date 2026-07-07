const sendSuccess = (res, data = null, meta = undefined, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
};

const sendFailure = (res, error, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error: {
      message: error.message,
      statusCode,
    },
  });
};

module.exports = {
  sendSuccess,
  sendFailure,
};
