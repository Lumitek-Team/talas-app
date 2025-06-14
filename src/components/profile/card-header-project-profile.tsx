"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CustomAlertDialog } from "../ui/custom-alert-dialog";
import { MoreVertical, 
  Archive, 
  Trash2, 
  PenBoxIcon,
  Pin,
  PinOff
 } from "lucide-react";
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
  isMyProfile?: boolean;
};

export function CardHeaderProjectProfile({
  title,
  createAt,
  onArchive,
  onDelete,
  onEdit, 
  isArchiving,
  onPin,
  onUnpin,
  isPinned,
  isMyProfile
}: CardHeaderArchiveProps) {
  const [menuOpen, setMenuOpen] = useState(false);

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
      onClick: onArchive
    },
    onDelete && {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      className: "text-red-500 hover:bg-red-500/10",
    },
    
  ]. filter(Boolean) as ActionItem[];

  return (
    <div className="relative flex justify-between items-end mb-5">
      <div className="flex flex-col">
        <h2>
          {isPinned && (
            <div className="flex items-center gap-2 text-md  px-0">
              <Pin className="w-5 h-5 text-green-500"/>
              <h2>Pinned Project</h2>
            </div>
          )}
        </h2>
        <h2 className="text-lg font-semibold flex items-center gap-2">
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
          disabled={isArchiving}
        >
          {isArchiving ? (
            <span className="text-xs text-gray-400">Archiving...</span>
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
