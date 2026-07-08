const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const routes = require('./routes');
const { requestIdMiddleware } = require('./middlewares/requestId.middleware');
const { requestContextMiddleware } = require('./middlewares/requestContext.middleware');
const { optionalActorMiddleware } = require('./middlewares/optionalActor.middleware');
const { notFoundMiddleware } = require('./middlewares/notFound.middleware');
const { errorMiddleware } = require('./middlewares/error.middleware');

const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(requestIdMiddleware);
  app.use(requestContextMiddleware);
  app.use(optionalActorMiddleware);
  app.use(morgan('dev'));

  app.use('/api', routes);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

module.exports = {
  createApp,
};
