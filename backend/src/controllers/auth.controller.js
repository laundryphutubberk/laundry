const authService = require('../services/auth.service');
const { sendSuccess } = require('../core/httpResponse');
const { validateLoginInput } = require('../validators/auth.validator');

const login = async (req, res, next) => {
  try {
    const input = validateLoginInput(req.body);
    const session = await authService.login(input);

    return sendSuccess(res, session);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  login,
};
