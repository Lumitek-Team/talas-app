"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  ShareIcon 
} from "@heroicons/react/24/outline";
import { 
  HeartIcon as HeartIconSolid
} from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";

interface Comment {
  id: string;
  username: string;
  avatarSrc: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];  // Add support for nested replies
  parentId?: string;    // Reference to parent comment
}

interface CommentItemProps {
  comment: Comment;
  onLike: () => void;
  onReply: (commentId: string) => void;
  onAddReply: (parentId: string, content: string) => void;
}

export function CommentItem({ comment, onLike, onReply, onAddReply }: CommentItemProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const handleReplyClick = () => {
    setShowReplyInput(!showReplyInput);
    onReply(comment.id);
  };

  const handleAddReply = () => {
    if (replyContent.trim()) {
      onAddReply(comment.id, replyContent);
      setReplyContent("");
      setShowReplyInput(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex gap-3">
        <Avatar src={comment.avatarSrc} alt={comment.username} className="w-8 h-8 mt-1" />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">{comment.username}</span>
            <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
          </div>
          <p className="text-sm mt-1 mb-2">{comment.content}</p>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={onLike}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-all cursor-pointer transform duration-200 active:scale-90"
            >
              {comment.isLiked ? (
                <HeartIconSolid className="w-4 h-4 text-primary" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
              <span>{comment.likes}</span>
            </button>
            
            <button 
              onClick={handleReplyClick}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-all cursor-pointer transform duration-200 active:scale-90"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>Reply</span>
            </button>
          </div>
          
          {/* Reply input field */}
          {showReplyInput && (
            <div className="flex gap-2 mt-3 items-center">
              <Avatar src="/img/dummy/profile-photo-dummy.jpg" alt="Your avatar" className="w-6 h-6" />
              <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-full px-3 py-1">
                <input
                  type="text"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground"
                />
                <Button
                  onClick={handleAddReply}
                  disabled={!replyContent.trim()}
                  className="rounded-full px-3 py-1 h-6 bg-primary text-white text-xs hover:bg-primary-foreground"
                >
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-11 ">  {/* Changed from space-y-4 to space-y-6 */}
          {comment.replies.map(reply => (
            <div key={reply.id} className="mt-6">  {/* Added mt-4 for vertical spacing */}
              <CommentItem
                comment={reply}
                onLike={() => onLike()}
                onReply={onReply}
                onAddReply={onAddReply}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}