// components/project/comment-section.tsx (Refactored - Main Listing Component)
"use client";

import { Separator } from "@/components/ui/separator";
import { CommentItem } from "./comment-item";      // Your refactored CommentItem
import { CommentForm } from "./comment-form";      // The new, separate CommentForm
import { trpc } from "@/app/_trpc/client";
import { CommentsInProjectType } from "@/lib/type";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react"; // For potential initial focus or other effects

interface CommentSectionProps {
  projectId: string;
  currentUser: ReturnType<typeof useUser>["user"]; // User object from Clerk, passed from project detail page
}

export function CommentSection({ projectId, currentUser }: CommentSectionProps) {
  const commentsQuery = trpc.project.getComments.useQuery(
    { id: projectId },
    { 
      enabled: !!projectId, // Query runs if projectId is available
      // Consider adding placeholderData or initialData if you have SSR for comments
    }
  );

  const handleCommentMutated = () => {
    commentsQuery.refetch();
  };

  const currentUserId = currentUser?.id;

  return (
    <div className="pt-4 pb-1 p-4">
      <h3 className="text-xl font-semibold mb-3 text-white">
        Comments ({commentsQuery.data?.length ?? 0})
      </h3>

      {/* Form for adding a new top-level comment */}
      <div>
        <CommentForm
          projectId={projectId}
          parentId={null} // For top-level comments
          mode="create"
          onSuccess={handleCommentMutated}
          compact={false} // Standard size for the main comment form
          autoFocus={false} // Usually don't autofocus the main comment box on page load
        />
      </div>

      {/* <Separator className="my-6 border-slate-700/50" /> */}

      <div className="flex flex-col space-y-1">
        {commentsQuery.isLoading && (
          <>
            {/* Skeleton loaders for comments */}
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={`skeleton-comment-${index}`} className="flex gap-3 py-3 animate-pulse">
                <div className="w-8 h-8 mt-1 rounded-full bg-slate-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/4 bg-slate-700 rounded"></div>
                  <div className="h-10 w-full bg-slate-700 rounded"></div>
                  <div className="h-4 w-1/2 bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </>
        )}

        {commentsQuery.isError && (
          <p className="text-red-500 py-4">Error loading comments: {commentsQuery.error.message}</p>
        )}

        {commentsQuery.data && commentsQuery.data.length === 0 && !commentsQuery.isLoading && (
          <p className="text-muted-foreground py-4">Be the first to share your thoughts!</p>
        )}

        {/* Render the tree of comments */}
        {commentsQuery.data &&
          commentsQuery.data.map((comment: CommentsInProjectType) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              projectId={projectId}
              currentUserId={currentUserId} // Pass current user's ID
              onCommentMutated={handleCommentMutated} // Pass the refetch function
              level={0} // Top-level comments
            />
          ))}
      </div>
    </div>
  );
}