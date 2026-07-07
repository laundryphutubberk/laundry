const DEFAULT_TAKE = 50;
const MAX_TAKE = 100;

const toPositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const normalizePagination = (query = {}) => {
  const take = Math.min(toPositiveInt(query.take, DEFAULT_TAKE), MAX_TAKE);
  const skip = Math.max(toPositiveInt(query.skip, 0), 0);

  return {
    skip,
    take,
  };
};

module.exports = {
  DEFAULT_TAKE,
  MAX_TAKE,
  toPositiveInt,
  normalizePagination,
};
