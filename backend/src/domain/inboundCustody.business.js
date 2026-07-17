/**
 * Inbound Custody business rules.
 *
 * Defines the lifecycle and invariants for the Inbound Custody Operation
 * that tracks resort self-delivery of linen to the laundry.
 *
 * Lifecycle:
 *   PENDING → RECEIPT_CONFIRMED → COUNT_EVIDENCE_RECORDED → CLOSED
 */

const CUSTODY_STATUS_TRANSITIONS = {
  PENDING: new Set(['RECEIPT_CONFIRMED']),
  RECEIPT_CONFIRMED: new Set(['COUNT_EVIDENCE_RECORDED']),
  COUNT_EVIDENCE_RECORDED: new Set(['CLOSED']),
  CLOSED: new Set([]),
};

const createBusinessError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const assertValidTransition = (currentStatus, nextStatus) => {
  const allowed = CUSTODY_STATUS_TRANSITIONS[currentStatus];
  if (!allowed || !allowed.has(nextStatus)) {
    throw createBusinessError(
      `Cannot transition Inbound Custody from ${currentStatus} to ${nextStatus}`,
      409,
    );
  }
};

const assertWorkIsInboundEligible = (work) => {
  if (!work) {
    throw createBusinessError('Laundry Work not found', 404);
  }
  // Inbound custody is only relevant for works that have been received
  // (i.e. bags have arrived at the laundry).
  if (!['BAG_RECEIVED', 'FACTORY_RECEIVED', 'BAG_OPENED', 'ITEM_COUNTED', 'TYPE_SORTED', 'COLOR_SORTED', 'DATA_RECORDED'].includes(work.currentStatus)) {
    throw createBusinessError(
      `Laundry Work status ${work.currentStatus} is not eligible for inbound custody tracking`,
      409,
    );
  }
};

const assertReceiptCanConfirm = ({ work, existingCustody }) => {
  assertWorkIsInboundEligible(work);
  if (existingCustody) {
    if (existingCustody.status !== 'PENDING') {
      throw createBusinessError(
        `Inbound Custody is already ${existingCustody.status}, cannot confirm receipt`,
        409,
      );
    }
  }
};

const assertCountEvidenceCanRecord = (custody) => {
  if (!custody) {
    throw createBusinessError('Inbound Custody operation not found', 404);
  }
  if (custody.status !== 'RECEIPT_CONFIRMED') {
    throw createBusinessError(
      `Inbound Custody must be RECEIPT_CONFIRMED before recording count evidence, current: ${custody.status}`,
      409,
    );
  }
};

const assertCanClose = (custody) => {
  if (!custody) {
    throw createBusinessError('Inbound Custody operation not found', 404);
  }
  if (custody.status !== 'COUNT_EVIDENCE_RECORDED') {
    throw createBusinessError(
      `Inbound Custody must be COUNT_EVIDENCE_RECORDED before closing, current: ${custody.status}`,
      409,
    );
  }
};

const buildCreateData = ({ workId, resortId, actor }) => ({
  workId: Number(workId),
  resortId: Number(resortId),
  profile: 'RESORT_SELF_DELIVERY',
  trackingLevel: 'COUNT_ONLY',
  status: 'PENDING',
});

const buildReceiptConfirmData = ({ actor }) => ({
  receiptConfirmedAt: new Date(),
  receiptConfirmedById: actor?.userId || null,
  status: 'RECEIPT_CONFIRMED',
  version: { increment: 1 },
});

const buildCountEvidenceData = ({ actor, countTotalItems }) => ({
  countEvidenceRecordedAt: new Date(),
  countEvidenceRecordedById: actor?.userId || null,
  countTotalItems: Number(countTotalItems || 0),
  status: 'COUNT_EVIDENCE_RECORDED',
  version: { increment: 1 },
});

const buildCloseData = ({ actor }) => ({
  closedAt: new Date(),
  closedById: actor?.userId || null,
  status: 'CLOSED',
  version: { increment: 1 },
});

module.exports = {
  assertValidTransition,
  assertWorkIsInboundEligible,
  assertReceiptCanConfirm,
  assertCountEvidenceCanRecord,
  assertCanClose,
  buildCreateData,
  buildReceiptConfirmData,
  buildCountEvidenceData,
  buildCloseData,
};
