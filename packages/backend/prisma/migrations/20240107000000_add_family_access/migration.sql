-- CreateEnum
CREATE TYPE "FamilyAccessLevel" AS ENUM ('view_only', 'view_and_notifications', 'full_without_delete');

-- CreateEnum
CREATE TYPE "FamilyAccessStatus" AS ENUM ('pending', 'active', 'revoked');

-- DropExisting FamilyAccess if it exists (old schema)
DROP TABLE IF EXISTS "FamilyAccess";

-- CreateTable
CREATE TABLE "FamilyAccess" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "relativeUserId" TEXT,
    "accessLevel" "FamilyAccessLevel" NOT NULL DEFAULT 'view_only',
    "status" "FamilyAccessStatus" NOT NULL DEFAULT 'pending',
    "inviteToken" TEXT NOT NULL,
    "inviteEmail" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FamilyAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FamilyAccess_inviteToken_key" ON "FamilyAccess"("inviteToken");
CREATE INDEX "FamilyAccess_ownerUserId_idx" ON "FamilyAccess"("ownerUserId");
CREATE INDEX "FamilyAccess_relativeUserId_idx" ON "FamilyAccess"("relativeUserId");
CREATE INDEX "FamilyAccess_inviteToken_idx" ON "FamilyAccess"("inviteToken");

-- AddForeignKey
ALTER TABLE "FamilyAccess" ADD CONSTRAINT "FamilyAccess_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FamilyAccess" ADD CONSTRAINT "FamilyAccess_relativeUserId_fkey" FOREIGN KEY ("relativeUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;