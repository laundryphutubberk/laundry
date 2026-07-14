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

const optionalPositiveIntString = z
  .string()
  .regex(/^\d+$/)
  .optional();

const workIdParamSchema = z.object({
  workId: z.coerce.number().int().positive(),
});

const listLaundryWorksQuerySchema = z.object({
  status: workStatusSchema.optional(),
  queue: z.enum(['today', 'pending', 'ready']).optional(),
  search: z.string().trim().max(100).optional(),
  skip: optionalPositiveIntString,
  take: optionalPositiveIntString,
});

const getLaundryWorkQuerySchema = z.object({}).strict();

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

const deleteLaundryWorkBodySchema = z.object({
  reason: z.string().trim().min(1).max(500),
});

const laundryWorkCommandBodySchema = z.object({
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
  workIdParamSchema,
  listLaundryWorksQuerySchema,
  getLaundryWorkQuerySchema,
  createLaundryWorkBodySchema,
  updateLaundryWorkStatusBodySchema,
  deleteLaundryWorkBodySchema,
  laundryWorkCommandBodySchema,
};
