const inboundCustodyBusiness = require('../domain/inboundCustody.business');
const inboundCustodyRepository = require('../repositories/inboundCustody.repository');
const laundryWorksRepository = require('../repositories/laundryWorks.repository');
const { logger } = require('../core/observability');
const { assertLaundryStaffActor } = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');

const buildActorLogContext = (actor) => ({
  actorId: actor?.userId,
  actorRole: actor?.role,
  workspaceType: actor?.workspaceType,
  actorResortId: actor?.resortId,
});

/**
 * Get the current inbound custody operation for a Laundry Work.
 */
const getCustodyByWorkId = async (workId, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildRequiredActorResortScopedWhere({ actor });

  const work = await laundryWorksRepository.findLaundryWorkById({
    workId,
    where,
  });

  if (!work) {
    const error = new Error('Laundry Work not found');
    error.statusCode = 404;
    throw error;
  }

  const custody = await inboundCustodyRepository.findCustodyByWorkId({ workId });

  return {
    work: {
      id: work.id,
      workNo: work.workNo,
      resortId: work.resortId,
      resortName: work.resort?.name,
      currentStatus: work.currentStatus,
    },
    custody: custody || null,
  };
};

/**
 * Initiate an Inbound Custody Operation for a Laundry Work.
 * Creates the custody record in PENDING status.
 */
const initiateCustody = async (workId, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildRequiredActorResortScopedWhere({ actor });

  return inboundCustodyRepository.transaction(async (tx) => {
    const work = await laundryWorksRepository.findLaundryWorkByIdForUpdate({
      workId,
      where,
      client: tx,
    });

    inboundCustodyBusiness.assertWorkIsInboundEligible(work);

    const existingCustody = await inboundCustodyRepository.findCustodyByWorkIdForUpdate({
      workId,
      client: tx,
    });

    if (existingCustody) {
      const error = new Error('Inbound Custody operation already exists for this Laundry Work');
      error.statusCode = 409;
      throw error;
    }

    const data = inboundCustodyBusiness.buildCreateData({
      workId,
      resortId: work.resortId,
      actor,
    });

    const custody = await inboundCustodyRepository.createCustody({
      data,
      client: tx,
    });

    logger.business('inbound.custody.initiated', {
      ...buildActorLogContext(actor),
      workId: work.id,
      workNo: work.workNo,
      custodyId: custody.id,
    });

    return custody;
  });
};

/**
 * Confirm receipt of linen at the laundry (PENDING → RECEIPT_CONFIRMED).
 */
const confirmReceipt = async (workId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildRequiredActorResortScopedWhere({ actor });

  return inboundCustodyRepository.transaction(async (tx) => {
    const work = await laundryWorksRepository.findLaundryWorkByIdForUpdate({
      workId,
      where,
      client: tx,
    });

    const existingCustody = await inboundCustodyRepository.findCustodyByWorkIdForUpdate({
      workId,
      client: tx,
    });

    inboundCustodyBusiness.assertReceiptCanConfirm({ work, existingCustody });

    let custody;
    if (!existingCustody) {
      // Auto-create custody record if it doesn't exist yet
      const createData = inboundCustodyBusiness.buildCreateData({
        workId,
        resortId: work.resortId,
        actor,
      });
      custody = await inboundCustodyRepository.createCustody({
        data: createData,
        client: tx,
      });
    }

    const updateData = inboundCustodyBusiness.buildReceiptConfirmData({ actor });
    custody = await inboundCustodyRepository.updateCustody({
      workId,
      data: updateData,
      client: tx,
    });

    logger.business('inbound.custody.receipt_confirmed', {
      ...buildActorLogContext(actor),
      workId: work.id,
      workNo: work.workNo,
      custodyId: custody.id,
    });

    return custody;
  });
};

/**
 * Record count evidence (RECEIPT_CONFIRMED → COUNT_EVIDENCE_RECORDED).
 */
const recordCountEvidence = async (workId, payload = {}, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildRequiredActorResortScopedWhere({ actor });

  return inboundCustodyRepository.transaction(async (tx) => {
    const work = await laundryWorksRepository.findLaundryWorkByIdForUpdate({
      workId,
      where,
      client: tx,
    });

    if (!work) {
      const error = new Error('Laundry Work not found');
      error.statusCode = 404;
      throw error;
    }

    const custody = await inboundCustodyRepository.findCustodyByWorkIdForUpdate({
      workId,
      client: tx,
    });

    inboundCustodyBusiness.assertCountEvidenceCanRecord(custody);

    const countTotalItems = payload.countTotalItems != null
      ? Number(payload.countTotalItems)
      : custody.countTotalItems;

    const updateData = inboundCustodyBusiness.buildCountEvidenceData({
      actor,
      countTotalItems,
    });

    const updated = await inboundCustodyRepository.updateCustody({
      workId,
      data: updateData,
      client: tx,
    });

    logger.business('inbound.custody.count_evidence_recorded', {
      ...buildActorLogContext(actor),
      workId: work.id,
      workNo: work.workNo,
      custodyId: updated.id,
      countTotalItems: updated.countTotalItems,
    });

    return updated;
  });
};

/**
 * Close the inbound custody operation (COUNT_EVIDENCE_RECORDED → CLOSED).
 */
const closeCustody = async (workId, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const where = buildRequiredActorResortScopedWhere({ actor });

  return inboundCustodyRepository.transaction(async (tx) => {
    const work = await laundryWorksRepository.findLaundryWorkByIdForUpdate({
      workId,
      where,
      client: tx,
    });

    if (!work) {
      const error = new Error('Laundry Work not found');
      error.statusCode = 404;
      throw error;
    }

    const custody = await inboundCustodyRepository.findCustodyByWorkIdForUpdate({
      workId,
      client: tx,
    });

    inboundCustodyBusiness.assertCanClose(custody);

    const updateData = inboundCustodyBusiness.buildCloseData({ actor });
    const updated = await inboundCustodyRepository.updateCustody({
      workId,
      data: updateData,
      client: tx,
    });

    logger.business('inbound.custody.closed', {
      ...buildActorLogContext(actor),
      workId: work.id,
      workNo: work.workNo,
      custodyId: updated.id,
    });

    return updated;
  });
};

module.exports = {
  getCustodyByWorkId,
  initiateCustody,
  confirmReceipt,
  recordCountEvidence,
  closeCustody,
};
