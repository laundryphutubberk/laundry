const { getRequestContext } = require('./requestContext');

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordHash',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
  'cookie',
  'secret',
  'apiKey',
]);

const metrics = {
  counters: Object.create(null),
  histograms: Object.create(null),
};

const nowIso = () => new Date().toISOString();

const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.entries(value).reduce((acc, [key, item]) => {
    if (SENSITIVE_KEYS.has(String(key).toLowerCase())) {
      acc[key] = '[REDACTED]';
      return acc;
    }

    acc[key] = sanitizeValue(item);
    return acc;
  }, {});
};

const normalizeLabelValue = (value) => String(value || 'unknown').toLowerCase();

const buildMetricKey = (name, labels = {}) => {
  const labelText = Object.entries(labels)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${normalizeLabelValue(value)}`)
    .join(',');

  return labelText ? `${name}{${labelText}}` : name;
};

const incrementCounter = (name, labels = {}, value = 1) => {
  const key = buildMetricKey(name, labels);
  metrics.counters[key] = (metrics.counters[key] || 0) + value;
  return metrics.counters[key];
};

const observeHistogram = (name, labels = {}, value) => {
  const key = buildMetricKey(name, labels);
  const current = metrics.histograms[key] || {
    count: 0,
    sum: 0,
    min: null,
    max: null,
  };

  current.count += 1;
  current.sum += value;
  current.min = current.min === null ? value : Math.min(current.min, value);
  current.max = current.max === null ? value : Math.max(current.max, value);
  current.avg = current.count ? Number((current.sum / current.count).toFixed(2)) : 0;

  metrics.histograms[key] = current;
  return current;
};

const getMetricsSnapshot = () => sanitizeValue(metrics);

const normalizePath = (path = '') => String(path)
  .split('?')[0]
  .replace(/[0-9a-f]{8}-[0-9a-f-]{27,}/gi, ':id')
  .replace(/\/\d+/g, '/:id');

const buildBaseLog = (level, event, payload = {}) => {
  const context = getRequestContext() || {};

  return sanitizeValue({
    timestamp: nowIso(),
    level,
    event,
    requestId: payload.requestId || context.requestId,
    correlationId: payload.correlationId || context.correlationId,
    method: payload.method || context.method,
    path: payload.path || context.path,
    ...payload,
  });
};

const writeLog = (level, event, payload = {}) => {
  const entry = buildBaseLog(level, event, payload);
  const output = JSON.stringify(entry);

  if (level === 'error') {
    console.error(output);
    return entry;
  }

  if (level === 'warn') {
    console.warn(output);
    return entry;
  }

  console.log(output);
  return entry;
};

const logger = {
  info: (event, payload) => writeLog('info', event, payload),
  warn: (event, payload) => writeLog('warn', event, payload),
  error: (event, payload) => writeLog('error', event, payload),
  audit: (event, payload) => writeLog('audit', event, payload),
  business: (event, payload) => writeLog('business', event, payload),
  security: (event, payload) => writeLog('security', event, payload),
};

const getDurationMs = (startedAt) => {
  const diff = process.hrtime.bigint() - startedAt;
  return Number(diff / 1000000n);
};

const requestObservabilityMiddleware = (req, res, next) => {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = getDurationMs(startedAt);
    const routePath = normalizePath(req.route?.path ? `${req.baseUrl}${req.route.path}` : req.originalUrl);
    const statusFamily = `${Math.floor(res.statusCode / 100)}xx`;

    incrementCounter('http_requests_total', {
      method: req.method,
      status: statusFamily,
    });

    observeHistogram('http_request_duration_ms', {
      method: req.method,
      status: statusFamily,
    }, durationMs);

    if (res.statusCode >= 500) {
      incrementCounter('http_errors_total', { status: statusFamily });
    }

    logger.info('http.request.completed', {
      method: req.method,
      path: routePath,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
};

module.exports = {
  getMetricsSnapshot,
  incrementCounter,
  logger,
  normalizePath,
  observeHistogram,
  requestObservabilityMiddleware,
  sanitizeValue,
};
