/*
  Warnings:

  - You are about to drop the column `description` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Notification` table. All the data in the column will be lost.
  - The `gender` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `CountSummary` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updated_at` to the `Comment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "genderType" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "notifType" AS ENUM ('FOLLOW', 'LIKE_PROJECT', 'LIKE_COMMENT', 'COMMENT');

-- CreateEnum
CREATE TYPE "ownershipType" AS ENUM ('OWNER', 'COLLABORATOR');

-- CreateEnum
CREATE TYPE "collabStatusType" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_id_project_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_id_project_fkey";

-- DropForeignKey
ALTER TABLE "CountSummary" DROP CONSTRAINT "CountSummary_id_user_fkey";

-- DropForeignKey
ALTER TABLE "LikeProject" DROP CONSTRAINT "LikeProject_id_project_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_id_category_fkey";

-- DropForeignKey
ALTER TABLE "ProjectUser" DROP CONSTRAINT "ProjectUser_id_project_fkey";

-- DropIndex
DROP INDEX "idx_user_isRead";

-- DropIndex
DROP INDEX "idx_title_project";

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "parent_id" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "description",
DROP COLUMN "isRead",
DROP COLUMN "updated_at",
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "type" "notifType" NOT NULL;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "link_figma" TEXT,
ADD COLUMN     "link_github" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "image1" DROP NOT NULL,
ALTER COLUMN "image2" DROP NOT NULL,
ALTER COLUMN "image3" DROP NOT NULL,
ALTER COLUMN "image4" DROP NOT NULL,
ALTER COLUMN "image5" DROP NOT NULL,
ALTER COLUMN "video" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProjectUser" ADD COLUMN     "collabStatus" "collabStatusType",
ADD COLUMN     "ownership" "ownershipType" NOT NULL DEFAULT 'OWNER';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "bio" DROP NOT NULL,
ALTER COLUMN "email_contact" DROP NOT NULL,
DROP COLUMN "gender",
ADD COLUMN     "gender" "genderType";

-- DropTable
DROP TABLE "CountSummary";

-- CreateTable
CREATE TABLE "count_summary" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "count_project" INTEGER NOT NULL DEFAULT 0,
    "count_following" INTEGER NOT NULL DEFAULT 0,
    "count_follower" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "all_notif_read" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "count_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pinProject" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "id_project" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pinProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "count_summary_id_user_key" ON "count_summary"("id_user");

-- CreateIndex
CREATE INDEX "idx_user_count_summary" ON "count_summary"("id_user");

-- CreateIndex
CREATE INDEX "idx_user_project_pin" ON "pinProject"("id_user", "id_project");

-- CreateIndex
CREATE INDEX "idx_user_notification" ON "Notification"("id_user");

-- CreateIndex
CREATE INDEX "idx_slug_project" ON "Project"("slug");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_id_category_fkey" FOREIGN KEY ("id_category") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "count_summary" ADD CONSTRAINT "count_summary_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUser" ADD CONSTRAINT "ProjectUser_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeProject" ADD CONSTRAINT "LikeProject_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinProject" ADD CONSTRAINT "pinProject_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinProject" ADD CONSTRAINT "pinProject_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
