-- CreateTable
CREATE TABLE `User` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `auth_type` VARCHAR(50) NOT NULL,
    `bio` TEXT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `email_contact` VARCHAR(255) NULL,
    `github` VARCHAR(255) NULL,
    `instagram` VARCHAR(255) NULL,
    `linkedin` VARCHAR(255) NULL,
    `photo_profile` VARCHAR(255) NULL,
    `username` VARCHAR(255) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `idx_username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `id` CHAR(26) NOT NULL,
    `id_category` CHAR(26) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `content` TEXT NOT NULL,
    `is_archived` BOOLEAN NOT NULL DEFAULT false,
    `image1` VARCHAR(255) NULL,
    `image2` VARCHAR(255) NULL,
    `image3` VARCHAR(255) NULL,
    `image4` VARCHAR(255) NULL,
    `image5` VARCHAR(255) NULL,
    `video` VARCHAR(255) NULL,
    `link_github` VARCHAR(255) NULL,
    `link_figma` VARCHAR(255) NULL,
    `count_likes` INTEGER NOT NULL DEFAULT 0,
    `count_comments` INTEGER NOT NULL DEFAULT 0,
    `popularity_score` DOUBLE NULL DEFAULT 0,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,

    UNIQUE INDEX `Project_slug_key`(`slug`),
    INDEX `idx_category`(`id_category`),
    INDEX `idx_slug_project`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` CHAR(26) NOT NULL,
    `id_user` CHAR(36) NOT NULL,
    `id_project` CHAR(26) NOT NULL,
    `content` TEXT NOT NULL,
    `count_like` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` TIMESTAMP(6) NOT NULL,
    `parent_id` CHAR(26) NULL,

    INDEX `idx_project_comment`(`id_project`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` CHAR(26) NOT NULL,
    `id_user` CHAR(36) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `type` ENUM('FOLLOW', 'LIKE_PROJECT', 'LIKE_COMMENT', 'COMMENT_PROJECT', 'COMMENT', 'REPLY_COMMENT', 'COLLABORATION') NOT NULL,

    INDEX `idx_user_notification`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` CHAR(26) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `count_projects` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `count_summary` (
    `id` CHAR(26) NOT NULL,
    `id_user` CHAR(36) NOT NULL,
    `count_project` INTEGER NOT NULL DEFAULT 0,
    `count_following` INTEGER NOT NULL DEFAULT 0,
    `count_follower` INTEGER NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `all_notif_read` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `count_summary_id_user_key`(`id_user`),
    INDEX `idx_user_count_summary`(`id_user`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Follow` (
    `id` CHAR(26) NOT NULL,
    `id_follower` CHAR(36) NOT NULL,
    `id_following` CHAR(36) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_follower_following`(`id_follower`, `id_following`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectUser` (
    `id` CHAR(26) NOT NULL,
    `id_user` CHAR(36) NOT NULL,
    `id_project` CHAR(26) NOT NULL,
    `ownership` ENUM('OWNER', 'COLLABORATOR') NOT NULL DEFAULT 'OWNER',
    `collabStatus` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_user_project`(`id_user`, `id_project`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bookmark` (
    `id` CHAR(26) NOT NULL,
    `id_user` CHAR(36) NOT NULL,
    `id_project` CHAR(26) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_user_project_bookmark`(`id_user`, `id_project`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LikeProject` (
    `id` CHAR(26) NOT NULL,
    `id_user` CHAR(36) NOT NULL,
    `id_project` CHAR(26) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_user_project_like`(`id_user`, `id_project`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LikeComment` (
    `id` CHAR(26) NOT NULL,
    `id_user` CHAR(36) NOT NULL,
    `id_comment` CHAR(26) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_user_comment_like`(`id_user`, `id_comment`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pinProject` (
    `id` CHAR(26) NOT NULL,
    `id_user` CHAR(36) NOT NULL,
    `id_project` CHAR(26) NOT NULL,
    `created_at` TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    INDEX `idx_user_project_pin`(`id_user`, `id_project`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_id_category_fkey` FOREIGN KEY (`id_category`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_id_project_fkey` FOREIGN KEY (`id_project`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Comment`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `count_summary` ADD CONSTRAINT `count_summary_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follow` ADD CONSTRAINT `Follow_id_follower_fkey` FOREIGN KEY (`id_follower`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Follow` ADD CONSTRAINT `Follow_id_following_fkey` FOREIGN KEY (`id_following`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectUser` ADD CONSTRAINT `ProjectUser_id_project_fkey` FOREIGN KEY (`id_project`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectUser` ADD CONSTRAINT `ProjectUser_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookmark` ADD CONSTRAINT `Bookmark_id_project_fkey` FOREIGN KEY (`id_project`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookmark` ADD CONSTRAINT `Bookmark_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LikeProject` ADD CONSTRAINT `LikeProject_id_project_fkey` FOREIGN KEY (`id_project`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LikeProject` ADD CONSTRAINT `LikeProject_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LikeComment` ADD CONSTRAINT `LikeComment_id_comment_fkey` FOREIGN KEY (`id_comment`) REFERENCES `Comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LikeComment` ADD CONSTRAINT `LikeComment_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pinProject` ADD CONSTRAINT `pinProject_id_project_fkey` FOREIGN KEY (`id_project`) REFERENCES `Project`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pinProject` ADD CONSTRAINT `pinProject_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
