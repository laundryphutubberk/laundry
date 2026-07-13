const { z } = require('zod');

const googleIntentSchema = z.object({ idToken: z.string().min(1) }).strict();
const stepUpSchema = z.object({
  password: z.string().min(1),
  purpose: z.enum(['LINK_IDENTITY', 'UNLINK_IDENTITY']),
  targetId: z.string().uuid(),
}).strict();
const completionSchema = z.object({ grant: z.string().min(10) }).strict();

module.exports = {
  validateGoogleIntent: (body) => googleIntentSchema.parse(body || {}),
  validateStepUp: (body) => stepUpSchema.parse(body || {}),
  validateCompletion: (body) => completionSchema.parse(body || {}),
};
