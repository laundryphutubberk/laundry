const { AsyncLocalStorage } = require('async_hooks');

const requestContextStorage = new AsyncLocalStorage();

const runWithRequestContext = (context, callback) => {
  return requestContextStorage.run(context, callback);
};

const getRequestContext = () => {
  return requestContextStorage.getStore();
};

const setRequestActor = (actor) => {
  const context = getRequestContext();

  if (context) {
    context.actor = actor;
  }

  return actor;
};

const getRequestActor = () => {
  return getRequestContext()?.actor || null;
};

module.exports = {
  runWithRequestContext,
  getRequestContext,
  setRequestActor,
  getRequestActor,
};
