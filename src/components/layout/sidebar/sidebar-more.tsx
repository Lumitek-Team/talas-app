"use client";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { MoreLeftSidebar } from "./more-left-sidebar";

export function SidebarMore({ isCollapsed }: { isCollapsed: boolean }) {
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (containerRef.current) {
      setSidebarWidth(containerRef.current.offsetWidth);
    }
  }, [isCollapsed]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        popupRef.current &&
        !popupRef.current.contains(target) &&
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setShowPopup(false);
      }
    }

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopup]);

  return (
    <div
      ref={containerRef}
      className={`relative ${isCollapsed ? "flex justify-center" : ""}`}
    >
      <button
        className="flex items-center gap-3 w-full px-6 py-4 text-base font-medium transition-transform duration-200 active:scale-90 text-white hover:bg-white/10 rounded-md"
        onClick={() => setShowPopup((prev) => !prev)}
      >
        <EllipsisHorizontalIcon className="w-6 h-6" />
        {!isCollapsed && <span>More</span>}
      </button>

      {showPopup && (
        <div
          ref={popupRef}
          className="absolute bottom-full mb-2 left-0 z-10 bg-[#2C2C2C] rounded-md shadow-lg transition-all duration-200"
          style={{ width: sidebarWidth }}
        >
          <MoreLeftSidebar isCollapsed={isCollapsed} />
        </div>
      )}
    </div>
  );
}
