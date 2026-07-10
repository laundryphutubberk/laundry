const laundryWorkImagesRepository = require('../repositories/laundryWorkImages.repository');
const laundryWorksRepository = require('../repositories/laundryWorks.repository');
const { assertLaundryStaffActor } = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');

const buildImageWhere = ({ actor, workId } = {}) => {
  const where = buildRequiredActorResortScopedWhere({ actor });
  if (workId) where.workId = Number(workId);
  return where;
};

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

  return laundryWorkImagesRepository.transaction(async (tx) => {
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
};

const updateLaundryWorkImage = async (imageId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildImageWhere({ actor });

  return laundryWorkImagesRepository.transaction(async (tx) => {
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
};

const setLaundryWorkImageCover = async (imageId, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildImageWhere({ actor });

  return laundryWorkImagesRepository.transaction(async (tx) => {
    const current = await laundryWorkImagesRepository.findLaundryWorkImageById({ imageId, where, client: tx });
    if (!current) {
      const error = new Error('Laundry Work image not found');
      error.statusCode = 404;
      throw error;
    }

    await assertWorkExists({ workId: current.workId, actor, client: tx, mutable: true });
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
};

const softDeleteLaundryWorkImage = async (imageId, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildImageWhere({ actor });

  return laundryWorkImagesRepository.transaction(async (tx) => {
    const current = await laundryWorkImagesRepository.findLaundryWorkImageById({ imageId, where, client: tx });
    if (!current) {
      const error = new Error('Laundry Work image not found');
      error.statusCode = 404;
      throw error;
    }

    await assertWorkExists({ workId: current.workId, actor, client: tx, mutable: true });
    return laundryWorkImagesRepository.softDeleteLaundryWorkImage({ imageId, where, client: tx });
  });
};

module.exports = {
  listLaundryWorkImages,
  createLaundryWorkImage,
  updateLaundryWorkImage,
  setLaundryWorkImageCover,
  softDeleteLaundryWorkImage,
};
