const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { env } = require('./config/env');

const routes = require('./routes');
const { requestIdMiddleware } = require('./middlewares/requestId.middleware');
const { requestContextMiddleware } = require('./middlewares/requestContext.middleware');
const { optionalActorMiddleware } = require('./middlewares/optionalActor.middleware');
const { notFoundMiddleware } = require('./middlewares/notFound.middleware');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { requestObservabilityMiddleware } = require('./core/observability');

const createApp = () => {
  const app = express();

  app.use(helmet());
  const trustedOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean);
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || trustedOrigins.includes(origin)) return callback(null, true);
      const error = new Error('Origin is not allowed');
      error.statusCode = 403;
      error.code = 'ORIGIN_NOT_ALLOWED';
      return callback(error);
    },
  }));
  app.use(express.json());
  app.use(requestIdMiddleware);
  app.use(requestContextMiddleware);
  app.use(optionalActorMiddleware);
  app.use(requestObservabilityMiddleware);

  app.use('/api', routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

module.exports = {
  createApp,
};
