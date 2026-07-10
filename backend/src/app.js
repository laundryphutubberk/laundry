const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const routes = require('./routes');
const { env } = require('./config/env');
const { requestIdMiddleware } = require('./middlewares/requestId.middleware');
const { requestContextMiddleware } = require('./middlewares/requestContext.middleware');
const { optionalActorMiddleware } = require('./middlewares/optionalActor.middleware');
const { notFoundMiddleware } = require('./middlewares/notFound.middleware');
const { errorMiddleware } = require('./middlewares/error.middleware');
const { requestObservabilityMiddleware } = require('./core/observability');

const createApp = () => {
  const app = express();

  const allowedOrigins = env.FRONTEND_URL
    ? env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];

  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.NODE_ENV !== 'production' || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
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
