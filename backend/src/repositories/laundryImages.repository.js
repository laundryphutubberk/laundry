const { prisma } = require('../core/prisma');

const getClient = (client) => client || prisma;

const imageSelect = {
  id: true,
  workId: true,
  resortId: true,
  url: true,
  publicId: true,
  provider: true,
  mimeType: true,
  originalName: true,
  sizeBytes: true,
  caption: true,
  displayOrder: true,
  isCover: true,
  uploadedById: true,
  uploadedAt: true,
  deletedAt: true,
  createdAt: true,
  updatedAt: true,
};

const listLaundryImages = async ({ where, client } = {}) => {
  const db = getClient(client);
  return db.laundryWorkImage.findMany({
    where,
    select: imageSelect,
    orderBy: [
      { isCover: 'desc' },
      { displayOrder: 'asc' },
      { uploadedAt: 'asc' },
      { id: 'asc' },
    ],
  });
};

const findLaundryImageById = async ({ imageId, where, client } = {}) => {
  const db = getClient(client);
  return db.laundryWorkImage.findFirst({
    where: {
      ...where,
      id: Number(imageId),
    },
    select: imageSelect,
  });
};

const createLaundryImage = async ({ data, client } = {}) => {
  const db = getClient(client);
  return db.laundryWorkImage.create({
    data,
    select: imageSelect,
  });
};

const updateLaundryImage = async ({ imageId, where, data, client } = {}) => {
  const db = getClient(client);
  const result = await db.laundryWorkImage.updateMany({
    where: {
      ...where,
      id: Number(imageId),
    },
    data,
  });

  if (!result.count) return null;
  return findLaundryImageById({ imageId, where, client: db });
};

const clearWorkCover = async ({ workId, resortId, exceptImageId, client } = {}) => {
  const db = getClient(client);
  return db.laundryWorkImage.updateMany({
    where: {
      workId: Number(workId),
      resortId: Number(resortId),
      deletedAt: null,
      isCover: true,
      ...(exceptImageId ? { id: { not: Number(exceptImageId) } } : {}),
    },
    data: {
      isCover: false,
    },
  });
};

const softDeleteLaundryImage = async ({ imageId, where, deletedAt = new Date(), client } = {}) => {
  return updateLaundryImage({
    imageId,
    where,
    data: {
      deletedAt,
      isCover: false,
    },
    client,
  });
};

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  listLaundryImages,
  findLaundryImageById,
  createLaundryImage,
  updateLaundryImage,
  clearWorkCover,
  softDeleteLaundryImage,
  transaction,
};
