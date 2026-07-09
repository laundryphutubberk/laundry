const authService = require('../services/auth.service');
const { sendSuccess } = require('../core/httpResponse');
const { validateLoginInput, validateRegisterInput } = require('../validators/auth.validator');

const login = async (req, res, next) => {
  try {
    const input = validateLoginInput(req.body);
    const session = await authService.login(input);

    return sendSuccess(res, session);
  } catch (error) {
    return next(error);
  }
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
};
