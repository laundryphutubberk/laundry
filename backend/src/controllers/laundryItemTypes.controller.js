const { sendSuccess } = require('../core/httpResponse');
const { getRequestPolicyContext } = require('../core/policyContext');
const service = require('../services/laundryItemTypes.service');
const {
  parseRequest,
  listLaundryItemTypesQuerySchema,
  itemTypeIdParamSchema,
  createLaundryItemTypeBodySchema,
  updateLaundryItemTypeBodySchema,
} = require('../validators/laundryItemTypes.validator');

const listLaundryItemTypesController = async (req, res, next) => {
  try {
    const query = parseRequest(listLaundryItemTypesQuerySchema, req.query);
    const result = await service.listLaundryItemTypes(query, getRequestPolicyContext(req));
    return sendSuccess(res, result.items, { pagination: result.pagination });
  } catch (error) { return next(error); }
};

const createLaundryItemTypeController = async (req, res, next) => {
  try {
    const body = parseRequest(createLaundryItemTypeBodySchema, req.body);
    return sendSuccess(res, await service.createLaundryItemType(body, getRequestPolicyContext(req)), undefined, 201);
  } catch (error) { return next(error); }
};

const updateLaundryItemTypeController = async (req, res, next) => {
  try {
    const { itemTypeId } = parseRequest(itemTypeIdParamSchema, req.params);
    const body = parseRequest(updateLaundryItemTypeBodySchema, req.body);
    return sendSuccess(res, await service.updateLaundryItemType(itemTypeId, body, getRequestPolicyContext(req)));
  } catch (error) { return next(error); }
};

module.exports = {
  listLaundryItemTypesController,
  listActiveLaundryItemTypesController: listLaundryItemTypesController,
  createLaundryItemTypeController,
  updateLaundryItemTypeController,
};
