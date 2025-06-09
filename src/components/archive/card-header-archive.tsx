"use client";

import { useState } from "react";
import { MoreVertical } from "lucide-react";
import { ActionMenu } from "@/components/setting/action-menu";

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
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex justify-between items-start mb-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button
        aria-label="More actions"
        onClick={(e) => {setMenuOpen(!menuOpen); e.stopPropagation();}}
        className="p-1 rounded hover:bg-white/10 transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </button>

      {menuOpen && (
        <ActionMenu
          onUnarchive={onUnarchive}
          onDelete={onDelete}
          onClose={() => setMenuOpen(false)}
        />
      )}
    </div>
  );
}
