CREATE TABLE "DeviceSession" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "familyId" TEXT NOT NULL,
    "credentialHash" TEXT NOT NULL,
    "previousHash" TEXT,
    "rotationCounter" INTEGER NOT NULL DEFAULT 0,
    "deviceLabel" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idleExpiresAt" TIMESTAMP(3) NOT NULL,
    "absoluteExpiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "compromisedAt" TIMESTAMP(3),
    CONSTRAINT "DeviceSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DeviceSession_userId_idx" ON "DeviceSession"("userId");
CREATE INDEX "DeviceSession_familyId_idx" ON "DeviceSession"("familyId");
CREATE INDEX "DeviceSession_idleExpiresAt_idx" ON "DeviceSession"("idleExpiresAt");
CREATE INDEX "DeviceSession_absoluteExpiresAt_idx" ON "DeviceSession"("absoluteExpiresAt");
CREATE INDEX "DeviceSession_revokedAt_idx" ON "DeviceSession"("revokedAt");

ALTER TABLE "DeviceSession" ADD CONSTRAINT "DeviceSession_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
