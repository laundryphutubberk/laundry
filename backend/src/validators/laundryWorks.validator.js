const { z } = require('zod');

const workStatusSchema = z.enum([
  'DRAFT',
  'BAG_RECEIVED',
  'FACTORY_RECEIVED',
  'BAG_OPENED',
  'ITEM_COUNTED',
  'TYPE_SORTED',
  'COLOR_SORTED',
  'DATA_RECORDED',
  'RETURNED',
  'CLOSED',
  'CANCELLED',
]);

const workspaceTypeSchema = z.enum(['LAUNDRY', 'RESORT']);

const optionalPositiveIntString = z
  .string()
  .regex(/^\d+$/)
  .optional();

const listLaundryWorksQuerySchema = z.object({
  workspaceType: workspaceTypeSchema.optional(),
  resortId: optionalPositiveIntString,
  status: workStatusSchema.optional(),
  skip: optionalPositiveIntString,
  take: optionalPositiveIntString,
});

const getLaundryWorkQuerySchema = z.object({
  workspaceType: workspaceTypeSchema.optional(),
  resortId: optionalPositiveIntString,
});

const createLaundryWorkBodySchema = z.object({
  resortId: z.coerce.number().int().positive(),
  workNo: z.string().trim().min(1).optional(),
  bagCount: z.coerce.number().int().min(0).optional(),
  receivedDate: z.string().datetime().optional(),
  note: z.string().trim().optional(),
  currentStatus: workStatusSchema.optional(),
});

const updateLaundryWorkStatusBodySchema = z.object({
  toStatus: workStatusSchema,
  changedById: z.coerce.number().int().positive().optional(),
  changedByName: z.string().trim().min(1).optional(),
  note: z.string().trim().optional(),
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
  listLaundryWorksQuerySchema,
  getLaundryWorkQuerySchema,
  createLaundryWorkBodySchema,
  updateLaundryWorkStatusBodySchema,
};
