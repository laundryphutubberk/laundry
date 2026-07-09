const { z } = require('zod');

const optionalPositiveIntString = z
  .string()
  .regex(/^\d+$/)
  .optional();

const listResortsQuerySchema = z.object({
  active: z.enum(['true', 'false']).optional(),
  skip: optionalPositiveIntString,
  take: optionalPositiveIntString,
});

const createResortBodySchema = z.object({
  name: z.string().trim().min(1),
  contactName: z.string().trim().optional(),
  contactPhone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

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
  listResortsQuerySchema,
  createResortBodySchema,
};
