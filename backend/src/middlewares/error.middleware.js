const errorMiddleware = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: {
      message: statusCode === 500 ? 'Internal server error' : error.message,
      statusCode,
    },
  });
};

module.exports = {
  errorMiddleware,
};
