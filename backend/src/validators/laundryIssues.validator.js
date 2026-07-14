const { z } = require('zod');

const issueTypes = ['DAMAGED', 'MISSING', 'COUNT_MISMATCH', 'RETURN_MISMATCH', 'OTHER'];
const issueStatuses = ['OPEN', 'REVIEWING', 'RESOLVED', 'CANCELLED'];

const workIdParamSchema = z.object({
  workId: z.coerce.number().int().positive(),
});

const issueIdParamSchema = z.object({
  issueId: z.coerce.number().int().positive(),
});

const listLaundryIssuesQuerySchema = z.object({
  status: z.enum(issueStatuses).optional(),
});

const optionalPositiveIntString = z.string().regex(/^\d+$/).optional();
const listGlobalLaundryIssuesQuerySchema = z.object({
  status: z.enum(issueStatuses).optional(),
  issueType: z.enum(issueTypes).optional(),
  active: z.enum(['true', 'false']).optional(),
  search: z.string().trim().max(100).optional(),
  skip: optionalPositiveIntString,
  take: optionalPositiveIntString,
}).strict();

const createLaundryIssueBodySchema = z.object({
  bagId: z.coerce.number().int().positive().optional(),
  countLineId: z.coerce.number().int().positive().optional(),
  itemTypeId: z.coerce.number().int().positive().optional(),
  colorGroup: z.string().trim().min(1).optional(),
  issueType: z.enum(issueTypes),
  quantity: z.coerce.number().int().nonnegative().default(0),
  description: z.string().trim().min(1).max(2000),
});

const updateLaundryIssueBodySchema = z.object({
  bagId: z.coerce.number().int().positive().nullable().optional(),
  countLineId: z.coerce.number().int().positive().nullable().optional(),
  itemTypeId: z.coerce.number().int().positive().nullable().optional(),
  colorGroup: z.string().trim().min(1).nullable().optional(),
  issueType: z.enum(issueTypes).optional(),
  quantity: z.coerce.number().int().nonnegative().optional(),
  description: z.string().trim().min(1).max(2000).optional(),
  status: z.enum(['OPEN', 'REVIEWING', 'CANCELLED']).optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required',
});

const resolveLaundryIssueBodySchema = z.object({
  resolutionNote: z.string().trim().min(1).max(2000),
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
  issueIdParamSchema,
  listLaundryIssuesQuerySchema,
  listGlobalLaundryIssuesQuerySchema,
  createLaundryIssueBodySchema,
  updateLaundryIssueBodySchema,
  resolveLaundryIssueBodySchema,
};
