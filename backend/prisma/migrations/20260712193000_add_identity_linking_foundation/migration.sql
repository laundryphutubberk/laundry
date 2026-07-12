CREATE TYPE "StepUpPurpose" AS ENUM ('LINK_IDENTITY', 'UNLINK_IDENTITY');

CREATE TABLE "IdentityLinkIntent" (
  "id" TEXT NOT NULL, "userId" INTEGER NOT NULL, "provider" "IdentityProvider" NOT NULL,
  "providerSubject" TEXT NOT NULL, "providerEmail" TEXT, "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "displayName" TEXT, "avatarUrl" TEXT, "sessionContext" TEXT NOT NULL, "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "expiresAt" TIMESTAMP(3) NOT NULL,
  "confirmedAt" TIMESTAMP(3), "consumedAt" TIMESTAMP(3), "cancelledAt" TIMESTAMP(3), "supersededAt" TIMESTAMP(3),
  CONSTRAINT "IdentityLinkIntent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "IdentityLinkIntent_userId_idx" ON "IdentityLinkIntent"("userId");
CREATE INDEX "IdentityLinkIntent_provider_providerSubject_idx" ON "IdentityLinkIntent"("provider", "providerSubject");
CREATE INDEX "IdentityLinkIntent_expiresAt_idx" ON "IdentityLinkIntent"("expiresAt");
CREATE UNIQUE INDEX "IdentityLinkIntent_one_active_key" ON "IdentityLinkIntent"("userId", "provider", "providerSubject")
WHERE "consumedAt" IS NULL AND "cancelledAt" IS NULL AND "supersededAt" IS NULL;

CREATE TABLE "StepUpGrant" (
  "id" TEXT NOT NULL, "userId" INTEGER NOT NULL, "purpose" "StepUpPurpose" NOT NULL,
  "targetId" TEXT NOT NULL, "secretHash" TEXT NOT NULL, "sessionContext" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "expiresAt" TIMESTAMP(3) NOT NULL, "consumedAt" TIMESTAMP(3),
  CONSTRAINT "StepUpGrant_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "StepUpGrant_userId_idx" ON "StepUpGrant"("userId");
CREATE INDEX "StepUpGrant_purpose_targetId_idx" ON "StepUpGrant"("purpose", "targetId");
CREATE INDEX "StepUpGrant_expiresAt_idx" ON "StepUpGrant"("expiresAt");

CREATE TABLE "IdentityUnlinkIntent" (
  "id" TEXT NOT NULL, "userId" INTEGER NOT NULL, "identityId" TEXT NOT NULL, "sessionContext" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3), "cancelledAt" TIMESTAMP(3),
  CONSTRAINT "IdentityUnlinkIntent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "IdentityUnlinkIntent_userId_idx" ON "IdentityUnlinkIntent"("userId");
CREATE INDEX "IdentityUnlinkIntent_identityId_idx" ON "IdentityUnlinkIntent"("identityId");
CREATE INDEX "IdentityUnlinkIntent_expiresAt_idx" ON "IdentityUnlinkIntent"("expiresAt");
CREATE UNIQUE INDEX "IdentityUnlinkIntent_one_active_key" ON "IdentityUnlinkIntent"("userId", "identityId")
WHERE "consumedAt" IS NULL AND "cancelledAt" IS NULL;

ALTER TABLE "IdentityLinkIntent" ADD CONSTRAINT "IdentityLinkIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StepUpGrant" ADD CONSTRAINT "StepUpGrant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IdentityUnlinkIntent" ADD CONSTRAINT "IdentityUnlinkIntent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IdentityUnlinkIntent" ADD CONSTRAINT "IdentityUnlinkIntent_identityId_fkey" FOREIGN KEY ("identityId") REFERENCES "UserIdentity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
