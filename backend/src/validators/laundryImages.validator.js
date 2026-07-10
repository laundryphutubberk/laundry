const { z } = require('zod');

const workIdParamSchema = z.object({
  workId: z.coerce.number().int().positive(),
});

const imageIdParamSchema = z.object({
  imageId: z.coerce.number().int().positive(),
});

const listLaundryImagesQuerySchema = z.object({}).strict();

const createLaundryImageBodySchema = z.object({
  url: z.string().trim().min(1).max(2048),
  publicId: z.string().trim().min(1).max(500).optional(),
  provider: z.string().trim().min(1).max(100).optional(),
  mimeType: z.string().trim().min(1).max(255).optional(),
  originalName: z.string().trim().min(1).max(500).optional(),
  sizeBytes: z.coerce.number().int().nonnegative().optional(),
  caption: z.string().trim().max(2000).optional(),
  displayOrder: z.coerce.number().int().nonnegative().optional(),
  isCover: z.boolean().optional(),
});

const updateLaundryImageCaptionBodySchema = z.object({
  caption: z.string().trim().max(2000).nullable(),
});

const emptyMutationBodySchema = z.object({}).strict();

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
  listLaundryImagesQuerySchema,
  createLaundryImageBodySchema,
  updateLaundryImageCaptionBodySchema,
  emptyMutationBodySchema,
};
