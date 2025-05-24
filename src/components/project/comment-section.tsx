"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CommentItem } from "./comment-item";

// Updated mock data to include nested comments
const MOCK_COMMENTS = [
  {
    id: "1",
    username: "xxdevilsfavorite",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    content: "give them a big hug for me",
    timestamp: "9 jam",
    likes: 12,
    isLiked: false,
    replies: [
      {
        id: "1-1",
        username: "hihihahastaya",
        avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
        content: "mantapp boskuuuu",
        timestamp: "3 jam",
        likes: 2,
        isLiked: false,
        parentId: "1"
      },
      {
        id: "1-2",
        username: "hihihahastaya",
        avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
        content: "mantapp boskuuuu",
        timestamp: "3 jam",
        likes: 1,
        isLiked: false,
        parentId: "1"
      },
      {
        id: "1-3",
        username: "hihihahastaya",
        avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
        content: "mantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuumantapp boskuuuu",
        timestamp: "3 jam",
        likes: 0,
        isLiked: false,
        parentId: "1"
      },
      {
        id: "1-4",
        username: "hihihahastaya",
        avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
        content: "mantapp boskuuuu",
        timestamp: "3 jam",
        likes: 0,
        isLiked: false,
        parentId: "1"
      }
    ]
  },
  {
    id: "2",
    username: "shandywinss",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    content: "give them a big hug for me",
    timestamp: "3 jam",
    likes: 5,
    isLiked: true,
    replies: []
  },
  {
    id: "3",
    username: "padliigongs",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    content: "give them a big hug for me",
    timestamp: "3 jam",
    likes: 8,
    isLiked: false
  },
  {
    id: "4",
    username: "greguusss",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    content: "give them a big hug for me",
    timestamp: "3 jam",
    likes: 3,
    isLiked: false
  },
  {
    id: "5",
    username: "niddayyy",
    avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
    content: "give them a big hug for me",
    timestamp: "3 jam",
    likes: 7,
    isLiked: false
  }
];

interface CommentSectionProps {
  projectId: string;
}

export function CommentSection({ projectId }: CommentSectionProps) {
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now().toString(),
      username: "You",
      avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
      content: newComment,
      timestamp: "Just now",
      likes: 0,
      isLiked: false,
      replies: []
    };
    
    setComments([comment, ...comments]);
    setNewComment("");
  };

  const handleLikeComment = (commentId: string) => {
    setComments(prevComments => {
      return prevComments.map(comment => {
        // Check if this is the comment to update
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked
          };
        }
        
        // Check if the comment is in replies
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  isLiked: !reply.isLiked
                };
              }
              return reply;
            })
          };
        }
        
        return comment;
      });
    });
  };

  const handleReply = (commentId: string) => {
    setActiveReplyId(activeReplyId === commentId ? null : commentId);
  };

  const handleAddReply = (parentId: string, content: string) => {
    if (!content.trim()) return;
    
    const newReply = {
      id: `${parentId}-${Date.now()}`,
      username: "You",
      avatarSrc: "/img/dummy/profile-photo-dummy.jpg",
      content: content,
      timestamp: "Just now",
      likes: 0,
      isLiked: false,
      parentId: parentId
    };
    
    setComments(prevComments => {
      return prevComments.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          };
        }
        return comment;
      });
    });
  };

  return (
    <div className="pt-6">
      <h3 className="font-medium mb-6">Comments</h3>
      
      {/* Comment input */}
      <div className="flex gap-3 mb-8">
        <Avatar src="/img/dummy/profile-photo-dummy.jpg" alt="Your avatar" className="w-8 h-8" />
        <div className="flex-1 flex items-center gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
          <Button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="rounded-full px-4 py-1.5 h-8 bg-primary text-white text-sm hover:bg-primary-foreground"
          >
            Post
          </Button>
        </div>
      </div>
      
      {/* Comments list */}
      <div className="flex flex-col">
        {comments.map(comment => (
          <div key={comment.id} className="mb-6">
            <CommentItem
              comment={comment}
              onLike={() => handleLikeComment(comment.id)}
              onReply={handleReply}
              onAddReply={handleAddReply}
            />
          </div>
        ))}
      </div>
    </div>
  );
}