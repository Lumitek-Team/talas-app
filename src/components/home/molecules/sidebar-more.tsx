"use client";

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6"
        >
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
        {!isCollapsed && <span>More</span>}
      </button>
    </div>
  );
}