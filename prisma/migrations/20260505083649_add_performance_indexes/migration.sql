-- CreateIndex
CREATE INDEX "idx_user_notification_read" ON "Notification"("id_user", "is_read");

-- CreateIndex
CREATE INDEX "idx_archived_created" ON "Project"("is_archived", "created_at");

-- CreateIndex
CREATE INDEX "idx_popularity_score" ON "Project"("popularity_score");

-- CreateIndex
CREATE INDEX "idx_user_collab_status" ON "ProjectUser"("id_user", "collabStatus");
