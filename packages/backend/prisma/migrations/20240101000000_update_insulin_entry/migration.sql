-- AlterEnum
-- Rename existing InsulinType enum values to lowercase and add new values

-- Step 1: Create new enum
CREATE TYPE "InsulinType_new" AS ENUM ('rapid', 'short', 'basal', 'mixed', 'other');

-- Step 2: Add InjectionSite enum
CREATE TYPE "InjectionSite" AS ENUM ('abdomen', 'thigh', 'arm', 'buttock', 'other');

-- Step 3: Alter table to use new enum (drop old column, add new)
ALTER TABLE "InsulinEntry"
  ADD COLUMN "insulinName" VARCHAR(100),
  ADD COLUMN "units" DOUBLE PRECISION,
  ADD COLUMN "injectionSite" "InjectionSite",
  ADD COLUMN "comment" VARCHAR(1000),
  ADD COLUMN "insulinType_new" "InsulinType_new";

-- Step 4: Migrate data
UPDATE "InsulinEntry" SET
  "units" = "dosage",
  "insulinType_new" = CASE
    WHEN "insulinType" = 'RAPID' THEN 'rapid'::"InsulinType_new"
    WHEN "insulinType" = 'SHORT' THEN 'short'::"InsulinType_new"
    WHEN "insulinType" = 'INTERMEDIATE' THEN 'basal'::"InsulinType_new"
    WHEN "insulinType" = 'LONG' THEN 'basal'::"InsulinType_new"
    WHEN "insulinType" = 'PREMIXED' THEN 'mixed'::"InsulinType_new"
    ELSE 'other'::"InsulinType_new"
  END,
  "insulinName" = "notes";

-- Step 5: Make units NOT NULL (after migration)
ALTER TABLE "InsulinEntry" ALTER COLUMN "units" SET NOT NULL;
ALTER TABLE "InsulinEntry" ALTER COLUMN "insulinType_new" SET NOT NULL;

-- Step 6: Drop old columns
ALTER TABLE "InsulinEntry"
  DROP COLUMN "insulinType",
  DROP COLUMN "dosage",
  DROP COLUMN "notes";

-- Step 7: Rename new column
ALTER TABLE "InsulinEntry" RENAME COLUMN "insulinType_new" TO "insulinType";

-- Step 8: Drop old enum
DROP TYPE "InsulinType";

-- Step 9: Rename new enum
ALTER TYPE "InsulinType_new" RENAME TO "InsulinType";

-- CreateIndex
CREATE INDEX "InsulinEntry_userId_insulinType_idx" ON "InsulinEntry"("userId", "insulinType");