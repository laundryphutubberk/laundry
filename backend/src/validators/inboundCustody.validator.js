const { z } = require('zod');

const workIdParamSchema = z.object({
  workId: z.coerce.number().int().positive(),
});

const confirmReceiptBodySchema = z.object({
  note: z.string().trim().max(500).optional(),
}).strict();

const recordCountEvidenceBodySchema = z.object({
  countTotalItems: z.coerce.number().int().min(0).optional(),
  note: z.string().trim().max(500).optional(),
}).strict();

const parseRequest = (schema, value) => {
  const result = schema.safeParse(value);

  if (!result.success) {
    const error = new Error('Invalid request payload');
    error.statusCode = 400;
    error.details = result.error.flatten();
    throw error;
  }

  return result.data;
};

module.exports = {
  parseRequest,
  workIdParamSchema,
  confirmReceiptBodySchema,
  recordCountEvidenceBodySchema,
};
