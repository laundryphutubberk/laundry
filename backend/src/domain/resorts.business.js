const createBusinessError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertResortExists = (resort) => {
  if (!resort) {
    throw createBusinessError('Resort not found', 404);
  }
};

const assertResortName = (name) => {
  if (!name || !String(name).trim()) {
    throw createBusinessError('Resort name is required');
  }
};

const assertResortCanBeDeactivated = ({ activeWorkCount = 0 }) => {
  if (Number(activeWorkCount) > 0) {
    throw createBusinessError('Resort cannot be deactivated while active Laundry Work exists');
  }
};

const buildCreateResortData = (payload = {}) => {
  assertResortName(payload.name);

  return {
    name: String(payload.name).trim(),
    contactName: payload.contactName || null,
    contactPhone: payload.contactPhone || null,
    address: payload.address || null,
    active: payload.active === undefined ? true : Boolean(payload.active),
  };
};

const buildUpdateResortData = ({ currentResort, payload = {} }) => {
  assertResortExists(currentResort);

  const nextName = payload.name === undefined ? currentResort.name : String(payload.name).trim();
  assertResortName(nextName);

  return {
    name: nextName,
    contactName: payload.contactName === undefined ? currentResort.contactName : payload.contactName,
    contactPhone: payload.contactPhone === undefined ? currentResort.contactPhone : payload.contactPhone,
    address: payload.address === undefined ? currentResort.address : payload.address,
    active: payload.active === undefined ? currentResort.active : Boolean(payload.active),
  };
};

const isDeactivationRequested = ({ currentResort, payload = {} }) => {
  return currentResort && currentResort.active === true && payload.active === false;
};

module.exports = {
  assertResortExists,
  assertResortName,
  assertResortCanBeDeactivated,
  buildCreateResortData,
  buildUpdateResortData,
  isDeactivationRequested,
};
