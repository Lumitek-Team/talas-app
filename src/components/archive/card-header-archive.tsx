"use client";

import { useState } from "react";
import { MoreVertical, Pencil, Trash2, ArrowUpRight } from "lucide-react";

type CardHeaderArchiveProps = {
  title: string;
  onEdit?: () => void;
  onUnarchive?: () => void;
  onDelete?: () => void;
};

export function CardHeaderArchive({
  title,
  onEdit,
  onUnarchive,
  onDelete,
}: CardHeaderArchiveProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative flex justify-between items-start mb-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <button
        aria-label="More actions"
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-1 rounded hover:bg-white/10 transition"
      >
        <MoreVertical className="w-5 h-5 text-gray-400" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-8 z-10 bg-card border border-white/10 rounded-xl shadow-md w-48 overflow-hidden">
          <button
            onClick={onEdit}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-white"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={onUnarchive}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-white"
          >
            <ArrowUpRight className="w-4 h-4" />
            Unarchive
          </button>
          <button
            onClick={onDelete}
            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 text-red-500"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
