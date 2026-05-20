-- Add OTHER to MealType enum
ALTER TYPE "MealType" ADD VALUE IF NOT EXISTS 'OTHER';

-- Add carbsPerBreadUnit to User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "carbsPerBreadUnit" DOUBLE PRECISION;

-- Add breadUnits, photoUrl, isFavorite to MealEntry
ALTER TABLE "MealEntry" ADD COLUMN IF NOT EXISTS "breadUnits" DOUBLE PRECISION;
ALTER TABLE "MealEntry" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;
ALTER TABLE "MealEntry" ADD COLUMN IF NOT EXISTS "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- Add index for favorites
CREATE INDEX IF NOT EXISTS "MealEntry_userId_isFavorite_idx" ON "MealEntry"("userId", "isFavorite");