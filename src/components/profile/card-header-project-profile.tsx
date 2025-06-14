"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { MoreVertical, Archive, Trash2, PenBoxIcon, Pin, PinOff } from "lucide-react";
import { ActionMenu } from "@/components/setting/action-menu";

type ActionItem = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
};

type CardHeaderArchiveProps = {
  title: string;
  createAt: string;
  onArchive?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
  isArchiving?: boolean;
  isPinned?: boolean;
  isPin?: boolean;      
  isUnPin?: boolean;    
  isDeleted?: boolean;
  isMyProfile?: boolean;
};

export function CardHeaderProjectProfile({
  title,
  createAt,
  onArchive,
  onDelete,
  onEdit,
  onPin,
  onUnpin,
  isArchiving,
  isPinned,
  isPin,
  isUnPin,
  isDeleted,
  isMyProfile,
}: CardHeaderArchiveProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const isActionInProgress = isArchiving || isPin || isUnPin;

  let buttonText = null;
  if (isArchiving) buttonText = "Archiving...";
  else if (isPin) buttonText = "Pinning...";
  else if (isUnPin) buttonText = "Unpinning...";
  else if (isDeleted) buttonText = "Delete...";

  const actions = [
    isPinned && onUnpin && {
      label: "Unpin",
      icon: <PinOff className="w-4 h-4 rotate-180" />,
      onClick: onUnpin,
    },
    !isPinned && onPin && {
      label: "Pin",
      icon: <Pin className="w-4 h-4" />,
      onClick: onPin,
    },
    onEdit && {
      label: "Edit",
      icon: <PenBoxIcon className="w-4 h-4" />,
      onClick: onEdit,
    },
    onArchive && {
      label: "Archive",
      icon: <Archive className="w-4 h-4" />,
      onClick: onArchive,
    },
    onDelete && {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      className: "text-red-500 hover:bg-red-500/10",
    },
  ].filter(Boolean) as ActionItem[];


  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const handleTitleClick = () => {
    const slug = slugify(title);
    router.push(`/project/${slug}`);
  };
console.log("onPin exists?", !!onPin);
console.log("onUnpin exists?", !!onUnpin);
  return (
    <div className="relative flex justify-between items-end mb-5">
      <div className="flex flex-col">
        {isPinned && (
          <div className="flex items-center gap-2 text-md px-0">
            <Pin className="w-5 h-5 text-green-500" />
            <h2>Pinned Project</h2>
          </div>
        )}
        <h2
          onClick={handleTitleClick}
          className="text-lg font-semibold flex items-center gap-2 cursor-pointer"
        >
          {title}
        </h2>
      </div>

      {isMyProfile ? (
        <button
          aria-label="More actions"
          onClick={(e) => {
            setMenuOpen(!menuOpen);
            e.stopPropagation();
          }}
          className="p-1 rounded hover:bg-white/10 transition"
          disabled={isActionInProgress}
        >
          {buttonText ? (
            <span className="text-xs text-gray-400">{buttonText}</span>
          ) : (
            <MoreVertical className="w-5 h-5 text-gray-400" />
          )}
        </button>
      ) : (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(createAt), { addSuffix: true })}
        </span>
      )}

      {menuOpen && (
        <ActionMenu
          actions={actions}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
