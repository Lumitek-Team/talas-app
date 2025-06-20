"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, 
  ArchiveRestore, 
  Trash2 
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
  onUnarchive?: () => void;
  onDelete?: () => void;
};

export function CardHeaderArchive({
  title,
  onUnarchive,
  onDelete,
}: CardHeaderArchiveProps) {

  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const actions = [
    onUnarchive && {
      label: "Unarchive",
      icon: <ArchiveRestore className="w-4 h-4" />,
      onClick: onUnarchive,
    },
    onDelete && {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: onDelete,
      className: "text-red-500 hover:bg-red-500/10",
    },
  ].filter(Boolean) as ActionItem[];

  return (
    <div className="relative flex justify-between items-end mb-5">
      <h2 onClick={() => router.push(`/project/${title}`)} className="text-lg font-semibold cursor cursor-pointer">{title}</h2>
      <button
        aria-label="More actions"
        onClick={(e) => {
          setMenuOpen(!menuOpen);
          e.stopPropagation();
        }}
        className="p-1 rounded hover:bg-white/10 transition cursor-pointer"
      >
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </button>

      {menuOpen && (
        <ActionMenu
          actions={actions}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
