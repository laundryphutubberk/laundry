-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('LAUNDRY_OWNER', 'LAUNDRY_MANAGER', 'LAUNDRY_STAFF', 'RESORT_OWNER', 'RESORT_STAFF');

-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('LAUNDRY', 'RESORT');

-- CreateEnum
CREATE TYPE "WorkStatus" AS ENUM ('DRAFT', 'BAG_RECEIVED', 'FACTORY_RECEIVED', 'BAG_OPENED', 'ITEM_COUNTED', 'TYPE_SORTED', 'COLOR_SORTED', 'DATA_RECORDED', 'RETURNED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BagStatus" AS ENUM ('RECEIVED', 'OPENED', 'COUNTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "MovementType" AS ENUM ('COUNTED_AT_LAUNDRY', 'ISSUE_REPORTED', 'RETURNED_TO_RESORT', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('DAMAGED', 'MISSING', 'COUNT_MISMATCH', 'RETURN_MISMATCH', 'OTHER');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'REVIEWING', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WashLoadStatus" AS ENUM ('DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WashLoadFitStatus" AS ENUM ('UNCHECKED', 'UNDER_LOADED', 'OPTIMAL', 'OVER_LOADED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "role" "UserRole" NOT NULL,
    "workspaceType" "WorkspaceType" NOT NULL,
    "resortId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resort" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "contactPhone" TEXT,
    "address" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaundryItemType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "weightPerPieceKg" DECIMAL(6,3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaundryItemType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaundryWork" (
    "id" SERIAL NOT NULL,
    "workNo" TEXT NOT NULL,
    "resortId" INTEGER NOT NULL,
    "bagCount" INTEGER NOT NULL DEFAULT 0,
    "currentStatus" "WorkStatus" NOT NULL DEFAULT 'DRAFT',
    "issueCount" INTEGER NOT NULL DEFAULT 0,
    "receivedDate" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdById" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaundryWork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaundryBag" (
    "id" SERIAL NOT NULL,
    "workId" INTEGER NOT NULL,
    "resortId" INTEGER NOT NULL,
    "bagNo" TEXT NOT NULL,
    "status" "BagStatus" NOT NULL DEFAULT 'RECEIVED',
    "receivedAt" TIMESTAMP(3),
    "openedAt" TIMESTAMP(3),
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaundryBag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaundryCountLine" (
    "id" SERIAL NOT NULL,
    "workId" INTEGER NOT NULL,
    "bagId" INTEGER,
    "resortId" INTEGER NOT NULL,
    "itemTypeId" INTEGER NOT NULL,
    "colorGroup" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "issueQuantity" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaundryCountLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinenMovement" (
    "id" SERIAL NOT NULL,
    "resortId" INTEGER NOT NULL,
    "workId" INTEGER,
    "itemTypeId" INTEGER NOT NULL,
    "colorGroup" TEXT,
    "movementType" "MovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "LinenMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinenInventorySummary" (
    "id" SERIAL NOT NULL,
    "resortId" INTEGER NOT NULL,
    "itemTypeId" INTEGER NOT NULL,
    "colorGroup" TEXT,
    "totalKnownQty" INTEGER NOT NULL DEFAULT 0,
    "atResortQty" INTEGER NOT NULL DEFAULT 0,
    "atLaundryQty" INTEGER NOT NULL DEFAULT 0,
    "issueQty" INTEGER NOT NULL DEFAULT 0,
    "returnedQty" INTEGER NOT NULL DEFAULT 0,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinenInventorySummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IssueReport" (
    "id" SERIAL NOT NULL,
    "workId" INTEGER NOT NULL,
    "resortId" INTEGER NOT NULL,
    "itemTypeId" INTEGER,
    "colorGroup" TEXT,
    "issueType" "IssueType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "reportedById" INTEGER,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IssueReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkStatusLog" (
    "id" SERIAL NOT NULL,
    "workId" INTEGER NOT NULL,
    "fromStatus" "WorkStatus",
    "toStatus" "WorkStatus" NOT NULL,
    "changedById" INTEGER,
    "changedByName" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "WorkStatusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaundryMachine" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "capacityKg" DECIMAL(6,2) NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaundryMachine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaundryMachineLoadRule" (
    "id" SERIAL NOT NULL,
    "machineId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "minWeightKg" DECIMAL(6,2) NOT NULL,
    "targetKg" DECIMAL(6,2) NOT NULL,
    "maxWeightKg" DECIMAL(6,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaundryMachineLoadRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WashLoadPlan" (
    "id" SERIAL NOT NULL,
    "workId" INTEGER NOT NULL,
    "machineId" INTEGER NOT NULL,
    "loadRuleId" INTEGER,
    "loadNo" INTEGER NOT NULL,
    "estimatedPieceCount" INTEGER NOT NULL,
    "totalWeightKg" DECIMAL(8,2) NOT NULL,
    "status" "WashLoadStatus" NOT NULL DEFAULT 'DRAFT',
    "fitStatus" "WashLoadFitStatus" NOT NULL DEFAULT 'UNCHECKED',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WashLoadPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_resortId_idx" ON "User"("resortId");

-- CreateIndex
CREATE INDEX "User_workspaceType_idx" ON "User"("workspaceType");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Resort_active_idx" ON "Resort"("active");

-- CreateIndex
CREATE INDEX "LaundryItemType_active_idx" ON "LaundryItemType"("active");

-- CreateIndex
CREATE UNIQUE INDEX "LaundryItemType_name_category_key" ON "LaundryItemType"("name", "category");

-- CreateIndex
CREATE UNIQUE INDEX "LaundryWork_workNo_key" ON "LaundryWork"("workNo");

-- CreateIndex
CREATE INDEX "LaundryWork_resortId_idx" ON "LaundryWork"("resortId");

-- CreateIndex
CREATE INDEX "LaundryWork_currentStatus_idx" ON "LaundryWork"("currentStatus");

-- CreateIndex
CREATE INDEX "LaundryWork_receivedDate_idx" ON "LaundryWork"("receivedDate");

-- CreateIndex
CREATE INDEX "LaundryWork_returnedAt_idx" ON "LaundryWork"("returnedAt");

-- CreateIndex
CREATE INDEX "LaundryWork_closedAt_idx" ON "LaundryWork"("closedAt");

-- CreateIndex
CREATE INDEX "LaundryBag_resortId_idx" ON "LaundryBag"("resortId");

-- CreateIndex
CREATE INDEX "LaundryBag_status_idx" ON "LaundryBag"("status");

-- CreateIndex
CREATE INDEX "LaundryBag_receivedAt_idx" ON "LaundryBag"("receivedAt");

-- CreateIndex
CREATE INDEX "LaundryBag_openedAt_idx" ON "LaundryBag"("openedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LaundryBag_workId_bagNo_key" ON "LaundryBag"("workId", "bagNo");

-- CreateIndex
CREATE INDEX "LaundryCountLine_workId_idx" ON "LaundryCountLine"("workId");

-- CreateIndex
CREATE INDEX "LaundryCountLine_bagId_idx" ON "LaundryCountLine"("bagId");

-- CreateIndex
CREATE INDEX "LaundryCountLine_resortId_idx" ON "LaundryCountLine"("resortId");

-- CreateIndex
CREATE INDEX "LaundryCountLine_itemTypeId_idx" ON "LaundryCountLine"("itemTypeId");

-- CreateIndex
CREATE INDEX "LaundryCountLine_colorGroup_idx" ON "LaundryCountLine"("colorGroup");

-- CreateIndex
CREATE INDEX "LinenMovement_resortId_idx" ON "LinenMovement"("resortId");

-- CreateIndex
CREATE INDEX "LinenMovement_workId_idx" ON "LinenMovement"("workId");

-- CreateIndex
CREATE INDEX "LinenMovement_itemTypeId_idx" ON "LinenMovement"("itemTypeId");

-- CreateIndex
CREATE INDEX "LinenMovement_colorGroup_idx" ON "LinenMovement"("colorGroup");

-- CreateIndex
CREATE INDEX "LinenMovement_movementType_idx" ON "LinenMovement"("movementType");

-- CreateIndex
CREATE INDEX "LinenMovement_occurredAt_idx" ON "LinenMovement"("occurredAt");

-- CreateIndex
CREATE INDEX "LinenInventorySummary_resortId_idx" ON "LinenInventorySummary"("resortId");

-- CreateIndex
CREATE INDEX "LinenInventorySummary_itemTypeId_idx" ON "LinenInventorySummary"("itemTypeId");

-- CreateIndex
CREATE INDEX "LinenInventorySummary_colorGroup_idx" ON "LinenInventorySummary"("colorGroup");

-- CreateIndex
CREATE UNIQUE INDEX "LinenInventorySummary_resortId_itemTypeId_colorGroup_key" ON "LinenInventorySummary"("resortId", "itemTypeId", "colorGroup");

-- CreateIndex
CREATE INDEX "IssueReport_workId_idx" ON "IssueReport"("workId");

-- CreateIndex
CREATE INDEX "IssueReport_resortId_idx" ON "IssueReport"("resortId");

-- CreateIndex
CREATE INDEX "IssueReport_itemTypeId_idx" ON "IssueReport"("itemTypeId");

-- CreateIndex
CREATE INDEX "IssueReport_colorGroup_idx" ON "IssueReport"("colorGroup");

-- CreateIndex
CREATE INDEX "IssueReport_status_idx" ON "IssueReport"("status");

-- CreateIndex
CREATE INDEX "IssueReport_reportedAt_idx" ON "IssueReport"("reportedAt");

-- CreateIndex
CREATE INDEX "WorkStatusLog_workId_idx" ON "WorkStatusLog"("workId");

-- CreateIndex
CREATE INDEX "WorkStatusLog_toStatus_idx" ON "WorkStatusLog"("toStatus");

-- CreateIndex
CREATE INDEX "WorkStatusLog_changedAt_idx" ON "WorkStatusLog"("changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LaundryMachine_code_key" ON "LaundryMachine"("code");

-- CreateIndex
CREATE INDEX "LaundryMachine_active_idx" ON "LaundryMachine"("active");

-- CreateIndex
CREATE INDEX "LaundryMachine_displayOrder_idx" ON "LaundryMachine"("displayOrder");

-- CreateIndex
CREATE INDEX "LaundryMachineLoadRule_machineId_idx" ON "LaundryMachineLoadRule"("machineId");

-- CreateIndex
CREATE INDEX "LaundryMachineLoadRule_active_idx" ON "LaundryMachineLoadRule"("active");

-- CreateIndex
CREATE INDEX "WashLoadPlan_workId_idx" ON "WashLoadPlan"("workId");

-- CreateIndex
CREATE INDEX "WashLoadPlan_machineId_idx" ON "WashLoadPlan"("machineId");

-- CreateIndex
CREATE INDEX "WashLoadPlan_loadRuleId_idx" ON "WashLoadPlan"("loadRuleId");

-- CreateIndex
CREATE INDEX "WashLoadPlan_status_idx" ON "WashLoadPlan"("status");

-- CreateIndex
CREATE INDEX "WashLoadPlan_fitStatus_idx" ON "WashLoadPlan"("fitStatus");

-- CreateIndex
CREATE UNIQUE INDEX "WashLoadPlan_workId_loadNo_key" ON "WashLoadPlan"("workId", "loadNo");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_resortId_fkey" FOREIGN KEY ("resortId") REFERENCES "Resort"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryWork" ADD CONSTRAINT "LaundryWork_resortId_fkey" FOREIGN KEY ("resortId") REFERENCES "Resort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryWork" ADD CONSTRAINT "LaundryWork_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryBag" ADD CONSTRAINT "LaundryBag_workId_fkey" FOREIGN KEY ("workId") REFERENCES "LaundryWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryBag" ADD CONSTRAINT "LaundryBag_resortId_fkey" FOREIGN KEY ("resortId") REFERENCES "Resort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryCountLine" ADD CONSTRAINT "LaundryCountLine_workId_fkey" FOREIGN KEY ("workId") REFERENCES "LaundryWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryCountLine" ADD CONSTRAINT "LaundryCountLine_bagId_fkey" FOREIGN KEY ("bagId") REFERENCES "LaundryBag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryCountLine" ADD CONSTRAINT "LaundryCountLine_resortId_fkey" FOREIGN KEY ("resortId") REFERENCES "Resort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryCountLine" ADD CONSTRAINT "LaundryCountLine_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "LaundryItemType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinenMovement" ADD CONSTRAINT "LinenMovement_resortId_fkey" FOREIGN KEY ("resortId") REFERENCES "Resort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinenMovement" ADD CONSTRAINT "LinenMovement_workId_fkey" FOREIGN KEY ("workId") REFERENCES "LaundryWork"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinenMovement" ADD CONSTRAINT "LinenMovement_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "LaundryItemType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinenInventorySummary" ADD CONSTRAINT "LinenInventorySummary_resortId_fkey" FOREIGN KEY ("resortId") REFERENCES "Resort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LinenInventorySummary" ADD CONSTRAINT "LinenInventorySummary_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "LaundryItemType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueReport" ADD CONSTRAINT "IssueReport_workId_fkey" FOREIGN KEY ("workId") REFERENCES "LaundryWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueReport" ADD CONSTRAINT "IssueReport_resortId_fkey" FOREIGN KEY ("resortId") REFERENCES "Resort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueReport" ADD CONSTRAINT "IssueReport_itemTypeId_fkey" FOREIGN KEY ("itemTypeId") REFERENCES "LaundryItemType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IssueReport" ADD CONSTRAINT "IssueReport_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkStatusLog" ADD CONSTRAINT "WorkStatusLog_workId_fkey" FOREIGN KEY ("workId") REFERENCES "LaundryWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryMachineLoadRule" ADD CONSTRAINT "LaundryMachineLoadRule_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "LaundryMachine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WashLoadPlan" ADD CONSTRAINT "WashLoadPlan_workId_fkey" FOREIGN KEY ("workId") REFERENCES "LaundryWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WashLoadPlan" ADD CONSTRAINT "WashLoadPlan_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "LaundryMachine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WashLoadPlan" ADD CONSTRAINT "WashLoadPlan_loadRuleId_fkey" FOREIGN KEY ("loadRuleId") REFERENCES "LaundryMachineLoadRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
