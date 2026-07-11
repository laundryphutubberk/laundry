const { prisma } = require('../core/prisma');

const getClient = (client) => client || prisma;

const imageOrderBy = [
  { isCover: 'desc' },
  { displayOrder: 'asc' },
  { uploadedAt: 'asc' },
  { id: 'asc' },
];

const listLaundryWorkImages = async ({ where, client } = {}) => {
  const db = getClient(client);
  return db.laundryWorkImage.findMany({
    where: {
      ...where,
      deletedAt: null,
    },
    orderBy: imageOrderBy,
  });
};

const findLaundryWorkImageById = async ({ imageId, where, client, includeDeleted = false } = {}) => {
  const db = getClient(client);
  return db.laundryWorkImage.findFirst({
    where: {
      ...where,
      id: Number(imageId),
      ...(includeDeleted ? {} : { deletedAt: null }),
    },
  });
};

const createLaundryWorkImage = async ({ data, client } = {}) => {
  const db = getClient(client);
  return db.laundryWorkImage.create({ data });
};

const updateLaundryWorkImage = async ({ imageId, where, data, client, includeDeleted = false } = {}) => {
  const db = getClient(client);
  const result = await db.laundryWorkImage.updateMany({
    where: {
      ...where,
      id: Number(imageId),
      deletedAt: null,
    },
    data,
  });

  if (!result.count) return null;
  return findLaundryWorkImageById({ imageId, where, client: db, includeDeleted });
};

const clearLaundryWorkCover = async ({ workId, resortId, excludeImageId, client } = {}) => {
  const db = getClient(client);
  return db.laundryWorkImage.updateMany({
    where: {
      workId: Number(workId),
      resortId: Number(resortId),
      deletedAt: null,
      isCover: true,
      ...(excludeImageId ? { id: { not: Number(excludeImageId) } } : {}),
    },
    data: { isCover: false },
  });
};

const softDeleteLaundryWorkImage = async ({ imageId, where, client } = {}) =>
  updateLaundryWorkImage({
    imageId,
    where,
    data: {
      deletedAt: new Date(),
      isCover: false,
    },
    client,
    includeDeleted: true,
  });

const transaction = async (callback) => prisma.$transaction(callback);

module.exports = {
  listLaundryWorkImages,
  findLaundryWorkImageById,
  createLaundryWorkImage,
  updateLaundryWorkImage,
  clearLaundryWorkCover,
  softDeleteLaundryWorkImage,
  transaction,
};
