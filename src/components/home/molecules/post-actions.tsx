"use client";

import { cn } from "@/lib/utils";
import { usePostsStore } from "@/lib/store/posts-store";
import { 
  HeartIcon, 
  ChatBubbleLeftIcon, 
  BookmarkIcon, 
  ShareIcon 
} from "@heroicons/react/24/outline";
import { 
  HeartIcon as HeartIconSolid, 
  BookmarkIcon as BookmarkIconSolid 
} from "@heroicons/react/24/solid";

interface PostActionsProps {
  postId: string;
  likes: number;
  comments: number;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  isLiked?: boolean;
}

export function PostActions({
  postId,
  likes,
  comments,
  onLike,
  onComment,
  onShare,
  isLiked = false,
}: PostActionsProps) {
  // Get save state and toggle function from our store
  const isPostSaved = usePostsStore(state => state.isPostSaved(postId));
  const toggleSavePost = usePostsStore(state => state.toggleSavePost);

  const handleSave = () => {
    toggleSavePost(postId);
    // This could be replaced with a direct API call in the future
  };

  return (
    <div className="flex justify-between items-center">
      <ActionButton 
        icon={isLiked ? (
          <HeartIconSolid className="w-5 h-5" />
        ) : (
          <HeartIcon className="w-5 h-5" />
        )}
        label={`${likes} Likes`}
        onClick={onLike}
        active={isLiked}
      />
      
      <ActionButton 
        icon={<ChatBubbleLeftIcon className="w-5 h-5" />}
        label={`${comments} Comments`}
        onClick={onComment}
      />
      
      <ActionButton 
        icon={isPostSaved ? (
          <BookmarkIconSolid className="w-5 h-5" />
        ) : (
          <BookmarkIcon className="w-5 h-5" />
        )}
        label="Save"
        onClick={handleSave}
        active={isPostSaved}
      />
      
      <ActionButton 
        icon={<ShareIcon className="w-5 h-5" />}
        label="Share"
        onClick={onShare}
      />
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

function ActionButton({ icon, label, onClick, active = false }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200",
        "hover:bg-gray-700/20 cursor-pointer focus:outline-none active:scale-90",
        "text-xs transform",
        active ? "text-primary" : "text-white/70"
      )}
      aria-label={label}
    >
      <span className={cn(
        "transition-transform duration-200",
        active ? "text-primary" : "text-white/70"
      )}>
        {icon}
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}