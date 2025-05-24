// components/home/molecules/post-actions.tsx (Modified)
"use client";

import { cn } from "@/lib/utils";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import {
  HeartIcon as HeartIconSolid,
  BookmarkIcon as BookmarkIconSolid,
} from "@heroicons/react/24/solid";

interface PostActionsProps {
  likes: number;        // Current like count from parent
  comments: number;
  onLikeToggle: () => void;    // Handler from parent for like action
  onComment: () => void;
  onShare: () => void;
  isLiked: boolean;     // Current liked state from parent
  isBookmarked: boolean; // Current bookmarked state from parent
  onBookmarkToggle: () => void; // Handler from parent for bookmark action
}

export function PostActions({
  likes,
  comments,
  onLikeToggle,
  onComment,
  onShare,
  isLiked,
  isBookmarked,
  onBookmarkToggle,
}: PostActionsProps) {
  // Removed local state for isBookmarked and tRPC mutations/utils

  return (
    <div className="flex justify-between items-center">
      <ActionButton
        icon={isLiked ? (
          <HeartIconSolid className="w-5 h-5" />
        ) : (
          <HeartIcon className="w-5 h-5" />
        )} // Icon state based on prop
        label={`${likes} Likes`}
        onClick={onLikeToggle} // Use prop handler
        active={isLiked}
      />

      <ActionButton
        icon={<ChatBubbleLeftIcon className="w-5 h-5" />}
        label={`${comments} Comments`}
        onClick={onComment}
      />

      <ActionButton
        icon={isBookmarked ? (
          <BookmarkIconSolid className="w-5 h-5" />
        ) : (
          <BookmarkIcon className="w-5 h-5" />
        )} // Icon state based on prop
        label="Save"
        onClick={onBookmarkToggle} // Use prop handler
        active={isBookmarked}
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
  disabled?: boolean;
}

function ActionButton({ icon, label, onClick, active = false, disabled = false }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1 px-2 py-1 rounded-md transition-all duration-200",
        "hover:bg-gray-700/20 cursor-pointer focus:outline-none active:scale-90",
        "text-xs transform",
        active ? "text-primary" : "text-white/70",
        disabled && "opacity-50 cursor-not-allowed"
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