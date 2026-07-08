const { AsyncLocalStorage } = require('async_hooks');

const requestContextStorage = new AsyncLocalStorage();

const runWithRequestContext = (context, callback) => {
  return requestContextStorage.run(context, callback);
};

const getRequestContext = () => {
  return requestContextStorage.getStore();
};

const getRequestActor = () => {
  const context = getRequestContext();
  return context ? context.actor || null : null;
};

const setRequestActor = (actor) => {
  const context = getRequestContext();

  if (!context) {
    return null;
  }

  context.actor = actor || null;
  return context.actor;
};

module.exports = {
  runWithRequestContext,
  getRequestContext,
  getRequestActor,
  setRequestActor,
};
