const { z } = require('zod');

const optionalPositiveIntString = z.string().regex(/^\d+$/).optional();
const nameSchema = z.string().trim().min(1).max(200);
const categorySchema = z.string().trim().max(200).nullable();
const weightSchema = z.coerce.number().positive().max(999.999).nullable();

const listLaundryItemTypesQuerySchema = z.object({
  active: z.enum(['true', 'false', 'all']).optional(),
  search: z.string().trim().max(100).optional(),
  skip: optionalPositiveIntString,
  take: optionalPositiveIntString,
}).strict();

const itemTypeIdParamSchema = z.object({
  itemTypeId: z.coerce.number().int().positive(),
}).strict();

const createLaundryItemTypeBodySchema = z.object({
  name: nameSchema,
  category: categorySchema.optional(),
  weightPerPieceKg: weightSchema.optional(),
  active: z.boolean().optional(),
}).strict();

const updateLaundryItemTypeBodySchema = z.object({
  name: nameSchema.optional(),
  category: categorySchema.optional(),
  weightPerPieceKg: weightSchema.optional(),
  active: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, {
  message: 'At least one Laundry Item Type field is required',
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
  listLaundryItemTypesQuerySchema,
  itemTypeIdParamSchema,
  createLaundryItemTypeBodySchema,
  updateLaundryItemTypeBodySchema,
};
