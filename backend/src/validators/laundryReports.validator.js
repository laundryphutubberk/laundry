const { z } = require('zod');

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const pagination = {
  skip: z.string().regex(/^\d+$/).optional(),
  take: z.string().regex(/^\d+$/).optional(),
  search: z.string().trim().max(100).optional(),
};
const dateRangeQuerySchema = z.object({ start: dateString.optional(), end: dateString.optional() }).strict();
const resortReportQuerySchema = z.object({ ...pagination, start: dateString.optional(), end: dateString.optional(), sort: z.enum(['name', 'totalWorks', 'activeWorks', 'closedWorks', 'bags', 'itemCount', 'issueCount']).optional(), order: z.enum(['asc', 'desc']).optional() }).strict();
const itemReportQuerySchema = z.object({ ...pagination, start: dateString.optional(), end: dateString.optional(), sort: z.enum(['name', 'quantity', 'workCount', 'weightKg']).optional(), order: z.enum(['asc', 'desc']).optional() }).strict();

const parseRequest = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success) throw Object.assign(new Error('Invalid report filters'), { statusCode: 400, details: result.error.flatten() });
  return result.data;
};

module.exports = { parseRequest, dateRangeQuerySchema, resortReportQuerySchema, itemReportQuerySchema };
