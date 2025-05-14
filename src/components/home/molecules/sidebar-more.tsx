"use client";

export function SidebarMore() {
  return (
    <div> {/* Removed px-4 from this div's className */}
      <button 
        className="flex items-center gap-3 w-full px-6 py-4 text-base font-medium text-white transition-colors hover:bg-white/10 rounded-md"
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
        <span>More</span>
      </button>
    </div>
  );
}