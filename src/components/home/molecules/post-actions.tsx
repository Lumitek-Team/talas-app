"use client";

import { cn } from "@/lib/utils";

interface PostActionsProps {
  likes: number;
  comments: number;
  onLike: () => void;
  onComment: () => void;
  onSave: () => void;
  onShare: () => void;
  isLiked?: boolean;
  isSaved?: boolean;
}

export function PostActions({
  likes,
  comments,
  onLike,
  onComment,
  onSave,
  onShare,
  isLiked = false,
  isSaved = false,
}: PostActionsProps) {
  return (
    <div className="flex justify-between items-center">
      <ActionButton 
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        }
        label={`${likes} Likes`}
        onClick={onLike}
        active={isLiked}
      />
      
      <ActionButton 
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        }
        label={`${comments} Comments`}
        onClick={onComment}
      />
      
      <ActionButton 
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={isSaved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
          </svg>
        }
        label="Save"
        onClick={onSave}
        active={isSaved}
      />
      
      <ActionButton 
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
          </svg>
        }
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
        "flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer",
        "hover:bg-gray-700/20 focus:outline-none",
        "text-xs",
        active ? "text-primary" : "text-white/70"
      )}
      aria-label={label}
    >
      <span className={active ? "text-primary" : "text-white/70"}>{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}