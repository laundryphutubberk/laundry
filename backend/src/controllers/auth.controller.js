const authService = require('../services/auth.service');
const { sendSuccess } = require('../core/httpResponse');
const { validateLoginInput, validateRegisterInput } = require('../validators/auth.validator');
const { env } = require('../config/env');

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',
  maxAge: env.AUTH_SESSION_ABSOLUTE_DAYS * 24 * 60 * 60 * 1000,
});

const readCookie = (req) => {
  const raw = req.headers.cookie || '';
  const prefix = `${env.AUTH_COOKIE_NAME}=`;
  const entry = raw.split(';').map((value) => value.trim()).find((value) => value.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : null;
};

const setSessionCookie = (res, credential) => res.cookie(env.AUTH_COOKIE_NAME, credential, cookieOptions());
const clearSessionCookie = (res) => res.clearCookie(env.AUTH_COOKIE_NAME, cookieOptions());
const publicSession = ({ credential, sessionId, ...session }) => session;

const login = async (req, res, next) => {
  try {
    const input = validateLoginInput(req.body);
    const session = await authService.login(input, { userAgent: req.get('user-agent') });
    if (session.credential) setSessionCookie(res, session.credential);

    return sendSuccess(res, publicSession(session));
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const session = await authService.refreshDeviceSession(readCookie(req));
    setSessionCookie(res, session.credential);
    return sendSuccess(res, publicSession(session));
  } catch (error) {
    clearSessionCookie(res);
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    await authService.logoutCurrent(readCookie(req));
    clearSessionCookie(res);
    return sendSuccess(res, { loggedOut: true });
  } catch (error) {
    clearSessionCookie(res);
    return next(error);
  }
};

const logoutAll = async (req, res, next) => {
  try {
    await authService.logoutAll(req.actor.userId);
    clearSessionCookie(res);
    return sendSuccess(res, { loggedOut: true, scope: 'all' });
  } catch (error) { return next(error); }
};

const listSessions = async (req, res, next) => {
  try {
    const current = readCookie(req)?.split('.')[0] || null;
    return sendSuccess(res, { items: await authService.listSessions(req.actor.userId, current) });
  } catch (error) { return next(error); }
};

const revokeSession = async (req, res, next) => {
  try {
    await authService.revokeSession(req.actor.userId, req.params.id);
    const current = readCookie(req)?.split('.')[0];
    if (current === req.params.id) clearSessionCookie(res);
    return sendSuccess(res, { revoked: true, sessionId: req.params.id });
  } catch (error) { return next(error); }
};

const register = async (req, res, next) => {
  try {
    const input = validateRegisterInput(req.body);
    const session = await authService.register(input);

    return sendSuccess(res, session, undefined, 201);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  login,
  register,
  refresh,
  logout,
  logoutAll,
  listSessions,
  revokeSession,
  readCookie,
};
