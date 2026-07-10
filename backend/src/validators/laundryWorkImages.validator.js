const { z } = require('zod');

const workIdParamSchema = z.object({
  workId: z.coerce.number().int().positive(),
});

const imageIdParamSchema = z.object({
  imageId: z.coerce.number().int().positive(),
});

const createLaundryWorkImageBodySchema = z.object({
  url: z.string().trim().url(),
  publicId: z.string().trim().min(1).optional(),
  provider: z.string().trim().min(1).max(50).optional(),
  mimeType: z.string().trim().min(1).max(100).optional(),
  originalName: z.string().trim().min(1).max(255).optional(),
  sizeBytes: z.coerce.number().int().nonnegative().optional(),
  caption: z.string().trim().max(1000).optional(),
  displayOrder: z.coerce.number().int().nonnegative().optional(),
  isCover: z.coerce.boolean().optional(),
});

const updateLaundryWorkImageBodySchema = z.object({
  caption: z.string().trim().max(1000).nullable().optional(),
  displayOrder: z.coerce.number().int().nonnegative().optional(),
}).refine((value) => Object.keys(value).length > 0, {
  message: 'At least one field is required',
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
  imageIdParamSchema,
  createLaundryWorkImageBodySchema,
  updateLaundryWorkImageBodySchema,
};
