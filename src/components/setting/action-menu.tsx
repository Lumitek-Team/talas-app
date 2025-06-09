"use client";

import { useEffect, useRef } from "react";
import { Trash2, ArrowUpRight } from "lucide-react";

type ActionMenuProps = {
  onUnarchive?: () => void;
  onDelete?: () => void;
  onClose: () => void;
};

export function ActionMenu({
  onUnarchive,
  onDelete,
  onClose,
}: ActionMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-8 z-10 bg-card border border-white/10 rounded-sm shadow-md w-48 overflow-hidden"
    >
      <button
        onClick={(e) => {onUnarchive?.(); e.stopPropagation()}}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-white"
      >
        <ArrowUpRight className="w-4 h-4" />
        Unarchive
      </button>
      <button
        onClick={(e) => {onDelete?.(); e.stopPropagation();}}
        className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-500/10 text-red-500"
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}
