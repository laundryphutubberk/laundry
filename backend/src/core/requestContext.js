const { AsyncLocalStorage } = require('async_hooks');

const requestContextStorage = new AsyncLocalStorage();

const runWithRequestContext = (context, callback) => {
  return requestContextStorage.run(context, callback);
};

const getRequestContext = () => {
  return requestContextStorage.getStore();
};

module.exports = {
  runWithRequestContext,
  getRequestContext,
};
