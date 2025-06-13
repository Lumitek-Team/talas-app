"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type ActionItem = {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  className?: string;
};

type ActionMenuProps = {
  actions: ActionItem[];
  onClose: () => void;
};

export function ActionMenu({ actions, onClose }: ActionMenuProps) {
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
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={(e) => {
            action.onClick();
            onClose();
            e.stopPropagation();
          }}
          className={cn(
            "w-full flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-white",
            action.className
          )}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}
