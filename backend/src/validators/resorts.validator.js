const { z } = require('zod');

const optionalPositiveIntString = z
  .string()
  .regex(/^\d+$/)
  .optional();

const optionalText = (max) => z.string().trim().max(max).optional();
const resortNameSchema = z.string().trim().min(1).max(200);

const listResortsQuerySchema = z.object({
  active: z.enum(['true', 'false']).optional(),
  search: z.string().trim().max(100).optional(),
  skip: optionalPositiveIntString,
  take: optionalPositiveIntString,
}).strict();

const createResortBodySchema = z.object({
  name: resortNameSchema,
  contactName: optionalText(200),
  contactPhone: optionalText(50),
  address: optionalText(1000),
}).strict();

const resortIdParamSchema = z.object({
  resortId: z.coerce.number().int().positive(),
}).strict();

const updateResortBodySchema = z.object({
  name: resortNameSchema.optional(),
  contactName: optionalText(200),
  contactPhone: optionalText(50),
  address: optionalText(1000),
  active: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one Resort field is required',
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
  resortIdParamSchema,
  updateResortBodySchema,
};
