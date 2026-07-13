CREATE TYPE "IdentityProvider" AS ENUM ('GOOGLE');

CREATE TABLE "UserIdentity" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "provider" "IdentityProvider" NOT NULL,
    "providerSubject" TEXT NOT NULL,
    "providerEmail" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3),
    "unlinkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserIdentity_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "UserIdentity_provider_providerSubject_key" ON "UserIdentity"("provider", "providerSubject");
CREATE INDEX "UserIdentity_userId_idx" ON "UserIdentity"("userId");
CREATE INDEX "UserIdentity_providerEmail_idx" ON "UserIdentity"("providerEmail");
CREATE INDEX "UserIdentity_unlinkedAt_idx" ON "UserIdentity"("unlinkedAt");

ALTER TABLE "UserIdentity" ADD CONSTRAINT "UserIdentity_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
