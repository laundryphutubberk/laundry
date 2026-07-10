const { sendSuccess } = require('../core/httpResponse');
const { getRequestPolicyContext } = require('../core/policyContext');
const {
  listLaundryWorkImages,
  createLaundryWorkImage,
  updateLaundryWorkImage,
  setLaundryWorkImageCover,
  softDeleteLaundryWorkImage,
} = require('../services/laundryWorkImages.service');
const {
  parseRequest,
  workIdParamSchema,
  imageIdParamSchema,
  createLaundryWorkImageBodySchema,
  updateLaundryWorkImageBodySchema,
} = require('../validators/laundryWorkImages.validator');

const listLaundryWorkImagesController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const images = await listLaundryWorkImages(params.workId, getRequestPolicyContext(req));
    return sendSuccess(res, images);
  } catch (error) {
    return next(error);
  }
};

const createLaundryWorkImageController = async (req, res, next) => {
  try {
    const params = parseRequest(workIdParamSchema, req.params);
    const body = parseRequest(createLaundryWorkImageBodySchema, req.body);
    const image = await createLaundryWorkImage(params.workId, body, getRequestPolicyContext(req));
    return sendSuccess(res, image, undefined, 201);
  } catch (error) {
    return next(error);
  }
};

const updateLaundryWorkImageController = async (req, res, next) => {
  try {
    const params = parseRequest(imageIdParamSchema, req.params);
    const body = parseRequest(updateLaundryWorkImageBodySchema, req.body);
    const image = await updateLaundryWorkImage(params.imageId, body, getRequestPolicyContext(req));
    return sendSuccess(res, image);
  } catch (error) {
    return next(error);
  }
};

const setLaundryWorkImageCoverController = async (req, res, next) => {
  try {
    const params = parseRequest(imageIdParamSchema, req.params);
    const image = await setLaundryWorkImageCover(params.imageId, getRequestPolicyContext(req));
    return sendSuccess(res, image);
  } catch (error) {
    return next(error);
  }
};

const softDeleteLaundryWorkImageController = async (req, res, next) => {
  try {
    const params = parseRequest(imageIdParamSchema, req.params);
    const image = await softDeleteLaundryWorkImage(params.imageId, getRequestPolicyContext(req));
    return sendSuccess(res, image);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listLaundryWorkImagesController,
  createLaundryWorkImageController,
  updateLaundryWorkImageController,
  setLaundryWorkImageCoverController,
  softDeleteLaundryWorkImageController,
};
