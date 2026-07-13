const { z } = require('zod');

const googleRegisterSchema = z.object({
  idToken: z.string().trim().min(1),
  rememberDevice: z.boolean().optional().default(false),
  deviceLabel: z.string().trim().min(1).max(120).optional(),
}).strict();

const validateGoogleRegisterInput = (input) => googleRegisterSchema.parse(input);

module.exports = { googleRegisterSchema, validateGoogleRegisterInput };
