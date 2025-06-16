-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "notifType" ADD VALUE 'COMMENT_PROJECT';
ALTER TYPE "notifType" ADD VALUE 'REPLY_COMMENT';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "popularity_score" DOUBLE PRECISION DEFAULT 0;
