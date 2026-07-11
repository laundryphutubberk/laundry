const { z } = require('zod');

const optionalPositiveIntString = z
  .string()
  .regex(/^\d+$/)
  .optional();

const positiveIntParamSchema = z.object({
  workId: z.coerce.number().int().positive(),
});

const countLineIdParamSchema = z.object({
  lineId: z.coerce.number().int().positive(),
});

const listLaundryCountLinesQuerySchema = z.object({
  bagId: optionalPositiveIntString,
  skip: optionalPositiveIntString,
  take: optionalPositiveIntString,
});

const createLaundryCountLineBodySchema = z.object({
  bagId: z.coerce.number().int().positive(),
  itemTypeId: z.coerce.number().int().positive(),
  colorGroup: z.string().trim().optional(),
  quantity: z.coerce.number().int().positive(),
  note: z.string().trim().optional(),
});

const updateLaundryCountLineBodySchema = z.object({
  bagId: z.coerce.number().int().positive().optional(),
  itemTypeId: z.coerce.number().int().positive().optional(),
  colorGroup: z.string().trim().nullable().optional(),
  quantity: z.coerce.number().int().positive().optional(),
  note: z.string().trim().nullable().optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required',
});

const completeLaundryCountingBodySchema = z.object({
  note: z.string().trim().max(500).optional(),
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
  positiveIntParamSchema,
  countLineIdParamSchema,
  listLaundryCountLinesQuerySchema,
  createLaundryCountLineBodySchema,
  updateLaundryCountLineBodySchema,
  completeLaundryCountingBodySchema,
};
