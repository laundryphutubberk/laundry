-- CreateEnum
CREATE TYPE "InboundCustodyProfile" AS ENUM ('RESORT_SELF_DELIVERY');

-- CreateEnum
CREATE TYPE "InboundTrackingLevel" AS ENUM ('COUNT_ONLY');

-- CreateEnum
CREATE TYPE "InboundCustodyStatus" AS ENUM ('PENDING', 'RECEIPT_CONFIRMED', 'COUNT_EVIDENCE_RECORDED', 'CLOSED');

-- CreateTable
CREATE TABLE "InboundCustodyOperation" (
    "id" SERIAL NOT NULL,
    "workId" INTEGER NOT NULL,
    "resortId" INTEGER NOT NULL,
    "profile" "InboundCustodyProfile" NOT NULL DEFAULT 'RESORT_SELF_DELIVERY',
    "trackingLevel" "InboundTrackingLevel" NOT NULL DEFAULT 'COUNT_ONLY',
    "status" "InboundCustodyStatus" NOT NULL DEFAULT 'PENDING',
    "receiptConfirmedAt" TIMESTAMP(3),
    "receiptConfirmedById" INTEGER,
    "countEvidenceRecordedAt" TIMESTAMP(3),
    "countEvidenceRecordedById" INTEGER,
    "countTotalItems" INTEGER NOT NULL DEFAULT 0,
    "closedAt" TIMESTAMP(3),
    "closedById" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InboundCustodyOperation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InboundCustodyOperation_workId_key" ON "InboundCustodyOperation"("workId");

-- CreateIndex
CREATE INDEX "InboundCustodyOperation_workId_idx" ON "InboundCustodyOperation"("workId");

-- CreateIndex
CREATE INDEX "InboundCustodyOperation_resortId_idx" ON "InboundCustodyOperation"("resortId");

-- CreateIndex
CREATE INDEX "InboundCustodyOperation_status_idx" ON "InboundCustodyOperation"("status");

-- AddForeignKey
ALTER TABLE "InboundCustodyOperation" ADD CONSTRAINT "InboundCustodyOperation_workId_fkey" FOREIGN KEY ("workId") REFERENCES "LaundryWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundCustodyOperation" ADD CONSTRAINT "InboundCustodyOperation_resortId_fkey" FOREIGN KEY ("resortId") REFERENCES "Resort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundCustodyOperation" ADD CONSTRAINT "InboundCustodyOperation_receiptConfirmedById_fkey" FOREIGN KEY ("receiptConfirmedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundCustodyOperation" ADD CONSTRAINT "InboundCustodyOperation_countEvidenceRecordedById_fkey" FOREIGN KEY ("countEvidenceRecordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InboundCustodyOperation" ADD CONSTRAINT "InboundCustodyOperation_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
