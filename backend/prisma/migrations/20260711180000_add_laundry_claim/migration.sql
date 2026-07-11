CREATE TYPE "ClaimStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'RESOLVED');
CREATE TABLE "LaundryClaim" (
  "id" SERIAL NOT NULL,
  "issueId" INTEGER NOT NULL,
  "status" "ClaimStatus" NOT NULL DEFAULT 'OPEN',
  "claimReason" TEXT NOT NULL,
  "reviewNote" TEXT,
  "resolutionNote" TEXT,
  "createdById" INTEGER,
  "reviewedById" INTEGER,
  "resolvedById" INTEGER,
  "reviewedAt" TIMESTAMP(3),
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LaundryClaim_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "LaundryClaim_issueId_key" ON "LaundryClaim"("issueId");
CREATE INDEX "LaundryClaim_status_idx" ON "LaundryClaim"("status");
CREATE INDEX "LaundryClaim_createdAt_idx" ON "LaundryClaim"("createdAt");
ALTER TABLE "LaundryClaim" ADD CONSTRAINT "LaundryClaim_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "IssueReport"("id") ON DELETE CASCADE ON UPDATE CASCADE;
