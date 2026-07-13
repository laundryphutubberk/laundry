CREATE TYPE "TenantStatus" AS ENUM ('PROVISIONING', 'ACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "LaundryWorkspaceStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "BranchStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'ARCHIVED');
CREATE TYPE "TenantRole" AS ENUM ('OWNER', 'MANAGER', 'STAFF', 'ACCOUNTANT', 'DRIVER');
CREATE TYPE "TenantMembershipStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED', 'REVOKED');

CREATE TABLE "Tenant" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "legalName" TEXT,
  "timezone" TEXT NOT NULL,
  "status" "TenantStatus" NOT NULL DEFAULT 'PROVISIONING',
  "createdById" INTEGER,
  "suspendedAt" TIMESTAMP(3),
  "suspensionReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LaundryWorkspace" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "status" "LaundryWorkspaceStatus" NOT NULL DEFAULT 'ACTIVE',
  "displayName" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "LaundryWorkspace_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Branch" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "laundryWorkspaceId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "timezone" TEXT,
  "address" TEXT,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "status" "BranchStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TenantMembership" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "userId" INTEGER NOT NULL,
  "role" "TenantRole" NOT NULL,
  "status" "TenantMembershipStatus" NOT NULL DEFAULT 'PENDING',
  "version" INTEGER NOT NULL DEFAULT 1,
  "positionTitle" TEXT,
  "activatedAt" TIMESTAMP(3),
  "suspendedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TenantMembership_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE INDEX "Tenant_status_idx" ON "Tenant"("status");
CREATE INDEX "Tenant_createdById_idx" ON "Tenant"("createdById");
CREATE UNIQUE INDEX "LaundryWorkspace_tenantId_key" ON "LaundryWorkspace"("tenantId");
CREATE UNIQUE INDEX "LaundryWorkspace_id_tenantId_key" ON "LaundryWorkspace"("id", "tenantId");
CREATE INDEX "LaundryWorkspace_status_idx" ON "LaundryWorkspace"("status");
CREATE UNIQUE INDEX "Branch_tenantId_code_key" ON "Branch"("tenantId", "code");
CREATE UNIQUE INDEX "Branch_one_default_per_tenant_key" ON "Branch"("tenantId") WHERE "isDefault" = true;
CREATE INDEX "Branch_tenantId_status_idx" ON "Branch"("tenantId", "status");
CREATE INDEX "Branch_laundryWorkspaceId_idx" ON "Branch"("laundryWorkspaceId");
CREATE UNIQUE INDEX "TenantMembership_tenantId_userId_key" ON "TenantMembership"("tenantId", "userId");
CREATE INDEX "TenantMembership_userId_status_idx" ON "TenantMembership"("userId", "status");
CREATE INDEX "TenantMembership_tenantId_status_role_idx" ON "TenantMembership"("tenantId", "status", "role");

ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "LaundryWorkspace" ADD CONSTRAINT "LaundryWorkspace_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_laundryWorkspaceId_tenantId_fkey" FOREIGN KEY ("laundryWorkspaceId", "tenantId") REFERENCES "LaundryWorkspace"("id", "tenantId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TenantMembership" ADD CONSTRAINT "TenantMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "Tenant" ("id", "slug", "displayName", "legalName", "timezone", "status", "updatedAt")
VALUES ('00000000-0000-4000-8000-000000000101', 'laundry-pilot', 'Laundry Pilot', NULL, 'Asia/Bangkok', 'ACTIVE', CURRENT_TIMESTAMP)
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "LaundryWorkspace" ("id", "tenantId", "status", "displayName", "updatedAt")
VALUES ('00000000-0000-4000-8000-000000000102', '00000000-0000-4000-8000-000000000101', 'ACTIVE', 'Laundry Pilot', CURRENT_TIMESTAMP)
ON CONFLICT ("tenantId") DO NOTHING;

INSERT INTO "Branch" ("id", "tenantId", "laundryWorkspaceId", "code", "name", "timezone", "isDefault", "status", "updatedAt")
VALUES ('00000000-0000-4000-8000-000000000103', '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000102', 'MAIN', 'สำนักงานใหญ่', 'Asia/Bangkok', true, 'ACTIVE', CURRENT_TIMESTAMP)
ON CONFLICT ("tenantId", "code") DO NOTHING;

-- DEVELOPMENT-ONLY OWNER BOOTSTRAP.
-- This database is explicitly classified as development-only. Production
-- onboarding and authoritative Tenant provisioning must replace this policy.
DO $$
DECLARE
  bootstrap_user_id INTEGER;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "User"
    WHERE "active" = true
      AND "workspaceType" = 'LAUNDRY'
      AND "onboardingStatus" <> 'PENDING'
      AND "role" = 'LAUNDRY_OWNER'
  ) THEN
    SELECT "id" INTO bootstrap_user_id
    FROM "User"
    WHERE "active" = true
      AND "workspaceType" = 'LAUNDRY'
      AND "onboardingStatus" <> 'PENDING'
    ORDER BY "id" ASC
    LIMIT 1;

    IF bootstrap_user_id IS NULL THEN
      RAISE EXCEPTION 'Development Pilot Tenant requires an eligible active Laundry User for OWNER bootstrap';
    END IF;

    UPDATE "User" SET "role" = 'LAUNDRY_OWNER', "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = bootstrap_user_id;
  END IF;
END $$;

INSERT INTO "TenantMembership" ("id", "tenantId", "userId", "role", "status", "version", "activatedAt", "updatedAt")
SELECT md5('laundry-pilot-membership-' || u."id"::text)::uuid::text,
       '00000000-0000-4000-8000-000000000101', u."id",
       CASE u."role"::text
         WHEN 'LAUNDRY_OWNER' THEN 'OWNER'::"TenantRole"
         WHEN 'LAUNDRY_MANAGER' THEN 'MANAGER'::"TenantRole"
         WHEN 'LAUNDRY_STAFF' THEN 'STAFF'::"TenantRole"
       END,
       'ACTIVE', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "User" u
WHERE u."active" = true
  AND u."workspaceType" = 'LAUNDRY'
  AND u."onboardingStatus" <> 'PENDING'
  AND u."role" IN ('LAUNDRY_OWNER', 'LAUNDRY_MANAGER', 'LAUNDRY_STAFF')
ON CONFLICT ("tenantId", "userId") DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "TenantMembership"
    WHERE "tenantId" = '00000000-0000-4000-8000-000000000101'
      AND "role" = 'OWNER' AND "status" = 'ACTIVE'
  ) THEN
    RAISE EXCEPTION 'Pilot Tenant requires at least one active OWNER membership';
  END IF;
END $$;
