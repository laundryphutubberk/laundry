const { z } = require('zod');

const workspaceTypeSchema = z.enum(['LAUNDRY', 'RESORT']);
const roleSchema = z.enum(['LAUNDRY_OWNER', 'LAUNDRY_MANAGER', 'LAUNDRY_STAFF', 'RESORT_OWNER', 'RESORT_STAFF']);

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  rememberDevice: z.boolean().optional().default(false),
  deviceLabel: z.string().trim().max(120).optional(),
});

const registerSchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(8),
    displayName: z.string().trim().min(1).optional(),
    role: roleSchema.default('LAUNDRY_STAFF'),
    workspaceType: workspaceTypeSchema.default('LAUNDRY'),
    resortId: z.coerce.number().int().positive().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.workspaceType === 'RESORT' && !value.resortId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['resortId'],
        message: 'resortId is required for Resort Workspace registration',
      });
    }

    if (value.workspaceType === 'LAUNDRY' && value.resortId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['resortId'],
        message: 'resortId is not allowed for Laundry Workspace registration',
      });
    }
  });

const validateLoginInput = (payload) => loginSchema.parse(payload || {});
const validateRegisterInput = (payload) => registerSchema.parse(payload || {});

module.exports = {
  validateLoginInput,
  validateRegisterInput,
};
