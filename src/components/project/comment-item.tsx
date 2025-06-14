// components/project/comment-item.tsx (Updated)
"use client";

import { useState } from "react";
// MODIFICATION: Add AvatarImage and AvatarFallback
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EllipsisHorizontalIcon, HeartIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CommentsInProjectType } from "@/lib/type";
import { trpc } from "@/app/_trpc/client";
// MODIFICATION: Add getInitials
import { getPublicUrl, getInitials } from "@/lib/utils";
import { CommentForm } from "./comment-form";
import { formatDistanceToNow } from 'date-fns';
import { CustomAlertDialog } from "@/components/ui/custom-alert-dialog"; // Import the new dialog

interface CommentItemProps {
  comment: CommentsInProjectType;
  projectId: string;
  currentUserId: string | undefined;
  onCommentMutated: () => void;
  level?: number;
}

export function CommentItem({
  comment,
  projectId,
  currentUserId,
  onCommentMutated,
  level = 0,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false); // State for delete dialog

  // ... (handleLikeComment remains the same placeholder) ...
  const handleLikeComment = () => {
    console.warn("Like functionality for comment ID:", comment.id, "is not fully implemented. Backend required.");
  };


  const deleteCommentMutation = trpc.comment.deleteById.useMutation({
    onSuccess: () => {
      onCommentMutated();
    },
    onError: (error) => {
      console.error("Failed to delete comment:", error);
      alert("Error deleting comment: " + error.message);
    },
  });

  const handleDeleteInitiate = () => {
    if (!currentUserId || currentUserId !== comment.user.id) {
      alert("You can only delete your own comments.");
      return;
    }
    setIsDeleteConfirmOpen(true); // Open the custom dialog
  };

  const handleConfirmDelete = () => {
    if (!currentUserId || currentUserId !== comment.user.id) return;
    deleteCommentMutation.mutate({
        id: comment.id,
        id_user: currentUserId,    // Changed back to snake_case
        id_project: projectId,     // Changed back to snake_case
    });
  };

  const userAvatar = comment.user.photo_profile
    ? (comment.user.photo_profile.startsWith('http') ? comment.user.photo_profile : getPublicUrl(comment.user.photo_profile))
    : "/img/dummy/profile-photo-dummy.jpg";

  const canEditOrDelete = currentUserId === comment.user.id;
  const canReply = level === 0;
  const formattedTimestamp = comment.created_at
    ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })
    : 'just now';

  let itemContainerClasses = "flex flex-col";
  if (level === 0) {
    itemContainerClasses += " mb-4"; // Only parent comments get bottom margin
  } else if (level === 1) {
    itemContainerClasses += " ml-11 mt-3"; // Child comments get top margin and left indent
  }
  // Removed redundant else if (level === 0) that was previously here

  let editFormContainerClasses = "mt-2 py-2";
  if (level === 0) { // Apply bottom margin to edit form if it's a top-level comment
    editFormContainerClasses += " mb-4";
  } else if (level === 1) {
    editFormContainerClasses += " ml-11";
  }

  if (isEditing) {
    return (
      <div className={editFormContainerClasses}> 
        <CommentForm /* ...props... */ 
          projectId={projectId}
          mode="edit"
          currentCommentId={comment.id}
          initialContent={comment.content}
          onSuccess={() => { setIsEditing(false); onCommentMutated(); }}
          onCancel={() => setIsEditing(false)}
          compact={false}
          autoFocus={true}
        />
      </div>
    );
  }

  return (
    <>
      <div className={itemContainerClasses}> {/* This will now have mb-4 for level 0 comments */}
        <div className="flex gap-3 py-1">
          <Avatar className="w-8 h-8 mt-1">
            <AvatarImage src={userAvatar} alt={comment.user.name || comment.user.username} />
            <AvatarFallback>
              {getInitials(comment.user.name || comment.user.username || 'U')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm text-white">{comment.user.name || comment.user.username}</span>
                <span className="text-xs text-muted-foreground" title={new Date(comment.created_at).toLocaleString()}>
                  {formattedTimestamp}
                </span>
              </div>
              {canEditOrDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-white">
                      <EllipsisHorizontalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  {/* MODIFIED DropdownMenuContent Styling */}
                  <DropdownMenuContent 
                    align="end" 
                    className="bg-card border border-white/10 text-white shadow-lg" // Matching page container
                  >
                    <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer hover:!bg-slate-700/50 focus:!bg-slate-700/80">
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDeleteInitiate} // Open custom dialog
                      disabled={deleteCommentMutation.isPending}
                      className="text-red-500 cursor-pointer hover:!bg-red-500/20 focus:!bg-red-500/20 focus:!text-red-500"
                    >
                      {deleteCommentMutation.isPending ? "Deleting..." : "Delete"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            <p className="text-sm mt-1 mb-2 text-slate-300 whitespace-pre-line">{comment.content}</p>
            <div className="flex items-center gap-3">
              {canReply && currentUserId && (
                  <button 
                    onClick={() => { setShowReplyForm(!showReplyForm); if (isEditing) setIsEditing(false); }}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-all"
                  >
                    <ChatBubbleLeftIcon className="w-3.5 h-3.5" />
                    <span>{showReplyForm ? "Cancel" : "Reply"}</span>
                  </button>
              )}
            </div>
            {canReply && showReplyForm && currentUserId && (
              <div className="mt-2">
                <CommentForm /* ...props... */ 
                    projectId={projectId}
                    parentId={comment.id}
                    mode="create"
                    onSuccess={() => { setShowReplyForm(false); onCommentMutated(); }}
                    onCancel={() => setShowReplyForm(false)}
                    compact={true}
                    autoFocus={true}
                />
              </div>
            )}
          </div>
        </div>
        {comment.children && comment.children.length > 0 && (
          <div className="mt-0 flex flex-col">
            {comment.children.map(reply => (
              <CommentItem key={reply.id} comment={reply} projectId={projectId} currentUserId={currentUserId} onCommentMutated={onCommentMutated} level={level + 1} />
            ))}
          </div>
        )}
      </div>

      {/* Custom Alert Dialog for Delete Confirmation */}
      <CustomAlertDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmText="Delete"
        confirmButtonVariant="destructive"
      />
    </>
  );
}