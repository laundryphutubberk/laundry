const repository = require('../repositories/laundryItemTypes.repository');
const { assertLaundryManagementActor, assertLaundryStaffActor } = require('../policies/authorization.policy');
const { normalizePagination } = require('../shared/pagination');

const createConflictError = () => Object.assign(new Error('Laundry Item Type name and category already exist'), {
  statusCode: 409,
  code: 'LAUNDRY_ITEM_TYPE_CONFLICT',
});

const normalizeCategory = (category) => {
  if (category === undefined) return undefined;
  const normalized = String(category || '').trim();
  return normalized || null;
};

const normalizeWeight = (weight) => {
  if (weight === undefined) return undefined;
  return weight === null ? null : Number(weight);
};

const listLaundryItemTypes = async (query = {}, context = {}) => {
  assertLaundryStaffActor(context.actor);
  const { skip, take } = normalizePagination(query);
  const where = {};
  const active = query.active ?? 'true';

  if (active !== 'all') where.active = active === true || active === 'true';
  if (query.search) {
    const search = String(query.search).trim();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }
  }

  const result = await repository.listLaundryItemTypes({ where, skip, take });
  return { items: result.items, pagination: { total: result.total, skip, take } };
};

const listActiveLaundryItemTypes = listLaundryItemTypes;

const assertNoConflict = async ({ name, category, excludeItemTypeId, client }) => {
  const conflict = await repository.findConflictingLaundryItemType({ name, category, excludeItemTypeId, client });
  if (conflict) throw createConflictError();
};

const createLaundryItemType = async (payload = {}, context = {}) => {
  assertLaundryManagementActor(context.actor);
  const data = {
    name: payload.name.trim(),
    category: normalizeCategory(payload.category),
    weightPerPieceKg: normalizeWeight(payload.weightPerPieceKg),
    active: payload.active ?? true,
  };

  try {
    return await repository.transaction(async (tx) => {
      await assertNoConflict({ name: data.name, category: data.category, client: tx });
      return repository.createLaundryItemType({ data, client: tx });
    });
  } catch (error) {
    if (error?.code === 'P2002') throw createConflictError();
    throw error;
  }
};

const updateLaundryItemType = async (itemTypeId, payload = {}, context = {}) => {
  assertLaundryManagementActor(context.actor);

  try {
    return await repository.transaction(async (tx) => {
      const current = await repository.findLaundryItemTypeById({ itemTypeId, client: tx });
      if (!current) throw Object.assign(new Error('Laundry Item Type not found'), { statusCode: 404 });

      const data = {
        ...(payload.name !== undefined ? { name: payload.name.trim() } : {}),
        ...(payload.category !== undefined ? { category: normalizeCategory(payload.category) } : {}),
        ...(payload.weightPerPieceKg !== undefined ? { weightPerPieceKg: normalizeWeight(payload.weightPerPieceKg) } : {}),
        ...(payload.active !== undefined ? { active: payload.active } : {}),
      };
      const nextName = data.name ?? current.name;
      const nextCategory = data.category !== undefined ? data.category : current.category;
      await assertNoConflict({ name: nextName, category: nextCategory, excludeItemTypeId: current.id, client: tx });
      return repository.updateLaundryItemType({ itemTypeId: current.id, data, client: tx });
    });
  } catch (error) {
    if (error?.code === 'P2002') throw createConflictError();
    throw error;
  }
};

module.exports = {
  listLaundryItemTypes,
  listActiveLaundryItemTypes,
  createLaundryItemType,
  updateLaundryItemType,
};
