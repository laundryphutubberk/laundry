ALTER TABLE "IssueReport"
ADD COLUMN "bagId" INTEGER,
ADD COLUMN "countLineId" INTEGER;

ALTER TABLE "IssueReport"
ADD CONSTRAINT "IssueReport_bagId_fkey"
FOREIGN KEY ("bagId") REFERENCES "LaundryBag"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "IssueReport"
ADD CONSTRAINT "IssueReport_countLineId_fkey"
FOREIGN KEY ("countLineId") REFERENCES "LaundryCountLine"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "IssueReport_bagId_idx" ON "IssueReport"("bagId");
CREATE INDEX "IssueReport_countLineId_idx" ON "IssueReport"("countLineId");
