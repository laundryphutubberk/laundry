const buckets = new Map();

const createAuthRateLimit = ({ limit = 5, windowMs = 5 * 60 * 1000, key = 'auth' } = {}) => (req, _res, next) => {
  const now = Date.now();
  const bucketKey = `${key}:${req.actor?.userId || req.ip || 'unknown'}`;
  const current = buckets.get(bucketKey);
  const bucket = !current || current.resetAt <= now ? { count: 0, resetAt: now + windowMs } : current;
  bucket.count += 1;
  buckets.set(bucketKey, bucket);
  if (bucket.count > limit) {
    const error = new Error('Too many authentication attempts');
    error.statusCode = 429;
    error.code = 'AUTH_RATE_LIMITED';
    return next(error);
  }
  return next();
};

module.exports = { createAuthRateLimit };
