const getRequestPolicyContext = (req) => ({
  actor: req.context ? req.context.actor : null,
});

module.exports = {
  getRequestPolicyContext,
};
