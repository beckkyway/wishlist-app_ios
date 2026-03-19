-- Step 1: Add new columns to Wishlist
ALTER TABLE "Wishlist" ADD COLUMN IF NOT EXISTS "occasion" TEXT;
ALTER TABLE "Wishlist" ADD COLUMN IF NOT EXISTS "occasionDate" TIMESTAMP(3);

-- Step 2: Add new columns to Item
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "isGroupGift" BOOLEAN NOT NULL DEFAULT false;

-- Step 3: Create new enums
CREATE TYPE "ItemStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'COLLECTING', 'COLLECTED');
CREATE TYPE "Priority_new" AS ENUM ('MUST_HAVE', 'NORMAL', 'DREAM');

-- Step 4: Add status column with default AVAILABLE
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "status" "ItemStatus" NOT NULL DEFAULT 'AVAILABLE';

-- Step 5: Migrate existing isReserved data to status
UPDATE "Item" SET "status" = 'RESERVED' WHERE "isReserved" = true;
UPDATE "Item" SET "status" = 'COLLECTING' WHERE "targetAmount" IS NOT NULL AND "isReserved" = false;

-- Step 6: Set isGroupGift based on targetAmount
UPDATE "Item" SET "isGroupGift" = true WHERE "targetAmount" IS NOT NULL;

-- Step 7: Migrate Priority enum
-- Add a temporary text column
ALTER TABLE "Item" ADD COLUMN "priority_text" TEXT;
UPDATE "Item" SET "priority_text" = CASE
  WHEN "priority"::text = 'HIGH' THEN 'MUST_HAVE'
  WHEN "priority"::text = 'MEDIUM' THEN 'NORMAL'
  WHEN "priority"::text = 'LOW' THEN 'DREAM'
  ELSE 'NORMAL'
END;

-- Drop old priority column and old enum
ALTER TABLE "Item" DROP COLUMN "priority";
DROP TYPE "Priority";

-- Rename new enum
ALTER TYPE "Priority_new" RENAME TO "Priority";

-- Add priority column with new type
ALTER TABLE "Item" ADD COLUMN "priority" "Priority" NOT NULL DEFAULT 'NORMAL';
UPDATE "Item" SET "priority" = "priority_text"::"Priority";
ALTER TABLE "Item" DROP COLUMN "priority_text";

-- Step 8: Drop the old isReserved column
ALTER TABLE "Item" DROP COLUMN IF EXISTS "isReserved";
