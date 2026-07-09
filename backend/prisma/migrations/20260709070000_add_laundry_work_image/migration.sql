-- CreateTable
CREATE TABLE "LaundryWorkImage" (
    "id" SERIAL NOT NULL,
    "workId" INTEGER NOT NULL,
    "resortId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'LOCAL',
    "mimeType" TEXT,
    "originalName" TEXT,
    "sizeBytes" INTEGER,
    "caption" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isCover" BOOLEAN NOT NULL DEFAULT false,
    "uploadedById" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaundryWorkImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LaundryWorkImage_workId_idx" ON "LaundryWorkImage"("workId");

-- CreateIndex
CREATE INDEX "LaundryWorkImage_resortId_idx" ON "LaundryWorkImage"("resortId");

-- CreateIndex
CREATE INDEX "LaundryWorkImage_isCover_idx" ON "LaundryWorkImage"("isCover");

-- CreateIndex
CREATE INDEX "LaundryWorkImage_deletedAt_idx" ON "LaundryWorkImage"("deletedAt");

-- CreateIndex
CREATE INDEX "LaundryWorkImage_displayOrder_idx" ON "LaundryWorkImage"("displayOrder");

-- AddForeignKey
ALTER TABLE "LaundryWorkImage" ADD CONSTRAINT "LaundryWorkImage_workId_fkey" FOREIGN KEY ("workId") REFERENCES "LaundryWork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaundryWorkImage" ADD CONSTRAINT "LaundryWorkImage_resortId_fkey" FOREIGN KEY ("resortId") REFERENCES "Resort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
