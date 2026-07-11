const laundryWorkImagesRepository = require('../repositories/laundryWorkImages.repository');
const laundryWorksRepository = require('../repositories/laundryWorks.repository');
const { logger } = require('../core/observability');
const { assertLaundryStaffActor } = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');
const imageStorage = require('../adapters/cloudinaryImageStorage.adapter');

const buildImageWhere = ({ actor, workId } = {}) => {
  const where = buildRequiredActorResortScopedWhere({ actor });
  if (workId) where.workId = Number(workId);
  return where;
};

const buildActorLogContext = (actor) => ({
  actorId: actor?.id,
  actorRole: actor?.role,
  workspaceType: actor?.workspaceType,
  actorResortId: actor?.resortId,
});

const assertWorkExists = async ({ workId, actor, client, mutable = false }) => {
  const work = await laundryWorksRepository.findLaundryWorkById({
    workId,
    where: buildRequiredActorResortScopedWhere({ actor }),
    client,
  });

  if (!work) {
    const error = new Error('Laundry Work not found');
    error.statusCode = 404;
    throw error;
  }

  if (mutable && ['CLOSED', 'CANCELLED'].includes(work.currentStatus)) {
    const error = new Error('Images cannot be changed on closed or cancelled Laundry Work');
    error.statusCode = 409;
    throw error;
  }

  return work;
};

const listLaundryWorkImages = async (workId, context = {}) => {
  const actor = context.actor;
  await assertWorkExists({ workId, actor });

  return laundryWorkImagesRepository.listLaundryWorkImages({
    where: buildImageWhere({ actor, workId }),
  });
};

const createLaundryWorkImage = async (workId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);

  const image = await laundryWorkImagesRepository.transaction(async (tx) => {
    const work = await assertWorkExists({ workId, actor, client: tx, mutable: true });

    if (payload.isCover) {
      await laundryWorkImagesRepository.clearLaundryWorkCover({
        workId: work.id,
        resortId: work.resortId,
        client: tx,
      });
    }

    return laundryWorkImagesRepository.createLaundryWorkImage({
      data: {
        workId: work.id,
        resortId: work.resortId,
        url: payload.url,
        publicId: payload.publicId,
        provider: payload.provider || 'LOCAL',
        mimeType: payload.mimeType,
        originalName: payload.originalName,
        sizeBytes: payload.sizeBytes,
        caption: payload.caption,
        displayOrder: payload.displayOrder || 0,
        isCover: Boolean(payload.isCover),
        uploadedById: actor.id || actor.userId,
      },
      client: tx,
    });
  });

  logger.business('laundry.image.created', {
    ...buildActorLogContext(actor),
    imageId: image.id,
    workId: image.workId,
    resortId: image.resortId,
    provider: image.provider,
    isCover: image.isCover,
  });

  return image;
};

const uploadLaundryWorkImage = async (workId, file, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  await assertWorkExists({ workId, actor, mutable: true });
  if (!file?.buffer) { const error = new Error('Image file is required'); error.statusCode = 400; throw error; }

  const uploaded = await imageStorage.uploadLaundryWorkImage({ buffer: file.buffer, workId, originalName: file.originalname });
  try {
    return await createLaundryWorkImage(workId, {
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
      provider: 'CLOUDINARY',
      mimeType: file.mimetype,
      originalName: file.originalname,
      sizeBytes: uploaded.bytes || file.size,
      caption: payload.caption,
      isCover: payload.isCover === true || payload.isCover === 'true',
    }, context);
  } catch (error) {
    try { await imageStorage.deleteLaundryWorkImage(uploaded.public_id); } catch (cleanupError) { logger.error('laundry.image.upload_cleanup_failed', { workId: Number(workId), publicId: uploaded.public_id, message: cleanupError.message }); }
    throw error;
  }
};

const updateLaundryWorkImage = async (imageId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildImageWhere({ actor });

  const image = await laundryWorkImagesRepository.transaction(async (tx) => {
    const current = await laundryWorkImagesRepository.findLaundryWorkImageById({ imageId, where, client: tx });
    if (!current) {
      const error = new Error('Laundry Work image not found');
      error.statusCode = 404;
      throw error;
    }

    await assertWorkExists({ workId: current.workId, actor, client: tx, mutable: true });

    return laundryWorkImagesRepository.updateLaundryWorkImage({
      imageId,
      where,
      data: payload,
      client: tx,
    });
  });

  logger.business('laundry.image.updated', {
    ...buildActorLogContext(actor),
    imageId: image.id,
    workId: image.workId,
    resortId: image.resortId,
  });

  return image;
};

const setLaundryWorkImageCover = async (imageId, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildImageWhere({ actor });

  const image = await laundryWorkImagesRepository.transaction(async (tx) => {
    const current = await laundryWorkImagesRepository.findLaundryWorkImageById({ imageId, where, client: tx });
    if (!current) {
      const error = new Error('Laundry Work image not found');
      error.statusCode = 404;
      throw error;
    }

    await assertWorkExists({ workId: current.workId, actor, client: tx, mutable: true });
    if (current.isCover) return current;

    await laundryWorkImagesRepository.clearLaundryWorkCover({
      workId: current.workId,
      resortId: current.resortId,
      excludeImageId: current.id,
      client: tx,
    });

    return laundryWorkImagesRepository.updateLaundryWorkImage({
      imageId,
      where,
      data: { isCover: true },
      client: tx,
    });
  });

  logger.business('laundry.image.cover.set', {
    ...buildActorLogContext(actor),
    imageId: image.id,
    workId: image.workId,
    resortId: image.resortId,
  });

  return image;
};

const softDeleteLaundryWorkImage = async (imageId, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildImageWhere({ actor });

  const image = await laundryWorkImagesRepository.transaction(async (tx) => {
    const current = await laundryWorkImagesRepository.findLaundryWorkImageById({ imageId, where, client: tx });
    if (!current) {
      const error = new Error('Laundry Work image not found');
      error.statusCode = 404;
      throw error;
    }

    await assertWorkExists({ workId: current.workId, actor, client: tx, mutable: true });
    if (current.provider === 'CLOUDINARY' && current.publicId) await imageStorage.deleteLaundryWorkImage(current.publicId);
    return laundryWorkImagesRepository.softDeleteLaundryWorkImage({ imageId, where, client: tx });
  });

  logger.business('laundry.image.deleted', {
    ...buildActorLogContext(actor),
    imageId: image.id,
    workId: image.workId,
    resortId: image.resortId,
    wasCover: image.isCover,
  });

  return image;
};

module.exports = {
  listLaundryWorkImages,
  createLaundryWorkImage,
  uploadLaundryWorkImage,
  updateLaundryWorkImage,
  setLaundryWorkImageCover,
  softDeleteLaundryWorkImage,
};
