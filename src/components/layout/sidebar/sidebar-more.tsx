"use client";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

interface SidebarMoreProps {
  isCollapsed: boolean;
}

export function SidebarMore({ isCollapsed }: SidebarMoreProps) {
  return (
    <div className={isCollapsed ? "flex justify-center" : ""}>
      <button 
        className={`flex items-center ${isCollapsed ? "justify-center" : ""} gap-3 w-full px-6 py-4 text-base font-medium text-white transition-colors hover:bg-white/10 rounded-md`}
        title={isCollapsed ? "More" : ""}
      >
        <EllipsisHorizontalIcon className="w-6 h-6" />
        {!isCollapsed && <span>More</span>}
      </button>
    </div>
  );
}