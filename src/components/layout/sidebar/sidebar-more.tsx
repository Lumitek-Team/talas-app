"use client";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils"; // Ensure cn is imported

interface SidebarMoreProps {
  isCollapsed: boolean;
}

export function SidebarMore({ isCollapsed }: SidebarMoreProps) {
  return (
    <div className={cn(isCollapsed ? "flex justify-center" : "")}>
      <button 
        className={cn(
          "flex items-center gap-3 w-full px-6 py-4 text-base font-medium text-white rounded-md cursor-pointer",
          isCollapsed ? "justify-center" : "",
          "transition-all duration-200 ease-in-out", // General transition
          "hover:bg-white/10 hover:scale-105 active:scale-90" // Added hover:scale-110
        )}
        title={isCollapsed ? "More" : ""}
      >
        <EllipsisHorizontalIcon className="w-6 h-6" />
        {!isCollapsed && <span>More</span>}
      </button>
    </div>
  );
}
