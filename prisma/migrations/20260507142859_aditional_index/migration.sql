-- CreateIndex
CREATE INDEX "idx_comment_parent" ON "Comment"("parent_id");

-- CreateIndex
CREATE INDEX "idx_user_comment" ON "Comment"("id_user");

-- CreateIndex
CREATE INDEX "idx_following" ON "Follow"("id_following");
