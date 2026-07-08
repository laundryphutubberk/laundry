const { z } = require('zod');

const bagStatusSchema = z.enum(['RECEIVED', 'OPENED', 'COUNTED', 'CLOSED']);
const workspaceTypeSchema = z.enum(['LAUNDRY', 'RESORT']);

const optionalPositiveIntString = z
  .string()
  .regex(/^\d+$/)
  .optional();

const listLaundryBagsQuerySchema = z.object({
  workspaceType: workspaceTypeSchema.optional(),
  resortId: optionalPositiveIntString,
  status: bagStatusSchema.optional(),
  skip: optionalPositiveIntString,
  take: optionalPositiveIntString,
});

const getLaundryBagQuerySchema = z.object({
  workspaceType: workspaceTypeSchema.optional(),
  resortId: optionalPositiveIntString,
});

const createLaundryBagBodySchema = z.object({
  bagNo: z.string().trim().min(1),
  receivedAt: z.string().datetime().optional(),
  note: z.string().trim().optional(),
});

const updateLaundryBagStatusBodySchema = z.object({
  toStatus: bagStatusSchema,
  openedAt: z.string().datetime().optional(),
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
  listLaundryBagsQuerySchema,
  getLaundryBagQuerySchema,
  createLaundryBagBodySchema,
  updateLaundryBagStatusBodySchema,
};
