const laundryImagesRepository = require('../repositories/laundryImages.repository');
const laundryWorksRepository = require('../repositories/laundryWorks.repository');
const { logger } = require('../core/observability');
const {
  assertLaundryStaffActor,
  assertLaundryManagementActor,
} = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');

const TERMINAL_WORK_STATUSES = new Set(['CLOSED', 'CANCELLED']);

const buildImageWhere = ({ actor, workId, activeOnly = true } = {}) => ({
  ...buildRequiredActorResortScopedWhere({ actor }),
  ...(workId ? { workId: Number(workId) } : {}),
  ...(activeOnly ? { deletedAt: null } : {}),
});

const buildActorLogContext = (actor) => ({
  actorId: actor?.id,
  actorRole: actor?.role,
  workspaceType: actor?.workspaceType,
  actorResortId: actor?.resortId,
});

const createNotFoundError = (message) => {
  const error = new Error(message);
  error.statusCode = 404;
  return error;
};

const createConflictError = (message) => {
  const error = new Error(message);
  error.statusCode = 409;
  return error;
};

const assertWorkExists = async ({ workId, actor, mutable = false, client }) => {
  const work = await laundryWorksRepository.findLaundryWorkById({
    workId,
    where: buildRequiredActorResortScopedWhere({ actor }),
    client,
  });

  if (!work) throw createNotFoundError('Laundry Work not found');

  if (mutable && TERMINAL_WORK_STATUSES.has(work.currentStatus)) {
    throw createConflictError('Images cannot be changed on closed or cancelled Laundry Work');
  }

  return work;
};

const assertImageExists = async ({ imageId, actor, mutable = false, client }) => {
  const image = await laundryImagesRepository.findLaundryImageById({
    imageId,
    where: buildImageWhere({ actor }),
    client,
  });

  if (!image) throw createNotFoundError('Laundry Image not found');

  const work = await assertWorkExists({
    workId: image.workId,
    actor,
    mutable,
    client,
  });

  return { image, work };
};

const listLaundryImages = async (workId, _query = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  await assertWorkExists({ workId, actor });

  return laundryImagesRepository.listLaundryImages({
    where: buildImageWhere({ actor, workId }),
  });
};

const createLaundryImage = async (workId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);

  const image = await laundryImagesRepository.transaction(async (tx) => {
    const work = await assertWorkExists({ workId, actor, mutable: true, client: tx });

    if (payload.isCover) {
      await laundryImagesRepository.clearWorkCover({
        workId: work.id,
        resortId: work.resortId,
        client: tx,
      });
    }

    return laundryImagesRepository.createLaundryImage({
      data: {
        workId: work.id,
        resortId: work.resortId,
        url: payload.url,
        publicId: payload.publicId || null,
        provider: payload.provider || 'LOCAL',
        mimeType: payload.mimeType || null,
        originalName: payload.originalName || null,
        sizeBytes: payload.sizeBytes ?? null,
        caption: payload.caption || null,
        displayOrder: payload.displayOrder ?? 0,
        isCover: Boolean(payload.isCover),
        uploadedById: actor.id,
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

const updateLaundryImageCaption = async (imageId, payload = {}, context = {}) => {
  const actor = assertLaundryManagementActor(context.actor);
  const where = buildImageWhere({ actor });

  const image = await laundryImagesRepository.transaction(async (tx) => {
    await assertImageExists({ imageId, actor, mutable: true, client: tx });

    return laundryImagesRepository.updateLaundryImage({
      imageId,
      where,
      data: {
        caption: payload.caption || null,
      },
      client: tx,
    });
  });

  logger.business('laundry.image.caption.updated', {
    ...buildActorLogContext(actor),
    imageId: image.id,
    workId: image.workId,
    resortId: image.resortId,
  });

  return image;
};

const setLaundryImageCover = async (imageId, context = {}) => {
  const actor = assertLaundryManagementActor(context.actor);
  const where = buildImageWhere({ actor });

  const image = await laundryImagesRepository.transaction(async (tx) => {
    const { image: current, work } = await assertImageExists({
      imageId,
      actor,
      mutable: true,
      client: tx,
    });

    if (current.isCover) return current;

    await laundryImagesRepository.clearWorkCover({
      workId: work.id,
      resortId: work.resortId,
      exceptImageId: current.id,
      client: tx,
    });

    return laundryImagesRepository.updateLaundryImage({
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

const deleteLaundryImage = async (imageId, context = {}) => {
  const actor = assertLaundryManagementActor(context.actor);
  const where = buildImageWhere({ actor });

  const image = await laundryImagesRepository.transaction(async (tx) => {
    await assertImageExists({ imageId, actor, mutable: true, client: tx });

    return laundryImagesRepository.softDeleteLaundryImage({
      imageId,
      where,
      client: tx,
    });
  });

  logger.business('laundry.image.deleted', {
    ...buildActorLogContext(actor),
    imageId: image.id,
    workId: image.workId,
    resortId: image.resortId,
  });

  return image;
};

module.exports = {
  listLaundryImages,
  createLaundryImage,
  updateLaundryImageCaption,
  setLaundryImageCover,
  deleteLaundryImage,
};
