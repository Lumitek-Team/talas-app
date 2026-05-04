-- CreateEnum
CREATE TYPE "genderType" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "notifType" AS ENUM ('FOLLOW', 'LIKE_PROJECT', 'LIKE_COMMENT', 'COMMENT_PROJECT', 'COMMENT', 'REPLY_COMMENT', 'COLLABORATION');

-- CreateEnum
CREATE TYPE "ownershipType" AS ENUM ('OWNER', 'COLLABORATOR');

-- CreateEnum
CREATE TYPE "collabStatusType" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" CHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "auth_type" VARCHAR(50) NOT NULL,
    "bio" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email_contact" VARCHAR(255),
    "github" VARCHAR(255),
    "instagram" VARCHAR(255),
    "linkedin" VARCHAR(255),
    "photo_profile" VARCHAR(255),
    "username" VARCHAR(255) NOT NULL,
    "gender" "genderType",

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" CHAR(26) NOT NULL,
    "id_category" CHAR(26) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "image1" VARCHAR(255),
    "image2" VARCHAR(255),
    "image3" VARCHAR(255),
    "image4" VARCHAR(255),
    "image5" VARCHAR(255),
    "video" VARCHAR(255),
    "link_github" VARCHAR(255),
    "link_figma" VARCHAR(255),
    "count_likes" INTEGER NOT NULL DEFAULT 0,
    "count_comments" INTEGER NOT NULL DEFAULT 0,
    "popularity_score" DOUBLE PRECISION DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" CHAR(26) NOT NULL,
    "id_user" CHAR(36) NOT NULL,
    "id_project" CHAR(26) NOT NULL,
    "content" TEXT NOT NULL,
    "count_like" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,
    "parent_id" CHAR(26),

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" CHAR(26) NOT NULL,
    "id_user" CHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "type" "notifType" NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" CHAR(26) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "count_projects" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "count_summary" (
    "id" CHAR(26) NOT NULL,
    "id_user" CHAR(36) NOT NULL,
    "count_project" INTEGER NOT NULL DEFAULT 0,
    "count_following" INTEGER NOT NULL DEFAULT 0,
    "count_follower" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "all_notif_read" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "count_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "id" CHAR(26) NOT NULL,
    "id_follower" CHAR(36) NOT NULL,
    "id_following" CHAR(36) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectUser" (
    "id" CHAR(26) NOT NULL,
    "id_user" CHAR(36) NOT NULL,
    "id_project" CHAR(26) NOT NULL,
    "ownership" "ownershipType" NOT NULL DEFAULT 'OWNER',
    "collabStatus" "collabStatusType",
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" CHAR(26) NOT NULL,
    "id_user" CHAR(36) NOT NULL,
    "id_project" CHAR(26) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikeProject" (
    "id" CHAR(26) NOT NULL,
    "id_user" CHAR(36) NOT NULL,
    "id_project" CHAR(26) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikeProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikeComment" (
    "id" CHAR(26) NOT NULL,
    "id_user" CHAR(36) NOT NULL,
    "id_comment" CHAR(26) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikeComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pinProject" (
    "id" CHAR(26) NOT NULL,
    "id_user" CHAR(36) NOT NULL,
    "id_project" CHAR(26) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pinProject_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "idx_username" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "idx_category" ON "Project"("id_category");

-- CreateIndex
CREATE INDEX "idx_slug_project" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "idx_project_comment" ON "Comment"("id_project");

-- CreateIndex
CREATE INDEX "idx_user_notification" ON "Notification"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "count_summary_id_user_key" ON "count_summary"("id_user");

-- CreateIndex
CREATE INDEX "idx_user_count_summary" ON "count_summary"("id_user");

-- CreateIndex
CREATE INDEX "idx_follower_following" ON "Follow"("id_follower", "id_following");

-- CreateIndex
CREATE INDEX "idx_user_project" ON "ProjectUser"("id_user", "id_project");

-- CreateIndex
CREATE INDEX "idx_user_project_bookmark" ON "Bookmark"("id_user", "id_project");

-- CreateIndex
CREATE INDEX "idx_user_project_like" ON "LikeProject"("id_user", "id_project");

-- CreateIndex
CREATE INDEX "idx_user_comment_like" ON "LikeComment"("id_user", "id_comment");

-- CreateIndex
CREATE INDEX "idx_user_project_pin" ON "pinProject"("id_user", "id_project");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_id_category_fkey" FOREIGN KEY ("id_category") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "count_summary" ADD CONSTRAINT "count_summary_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_id_follower_fkey" FOREIGN KEY ("id_follower") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_id_following_fkey" FOREIGN KEY ("id_following") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUser" ADD CONSTRAINT "ProjectUser_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectUser" ADD CONSTRAINT "ProjectUser_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeProject" ADD CONSTRAINT "LikeProject_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeProject" ADD CONSTRAINT "LikeProject_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeComment" ADD CONSTRAINT "LikeComment_id_comment_fkey" FOREIGN KEY ("id_comment") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeComment" ADD CONSTRAINT "LikeComment_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinProject" ADD CONSTRAINT "pinProject_id_project_fkey" FOREIGN KEY ("id_project") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinProject" ADD CONSTRAINT "pinProject_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
