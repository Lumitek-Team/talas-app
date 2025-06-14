"use client";

import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { useEffect, useRef, useState } from "react";
import { MoreLeftSidebar } from "./more-left-sidebar";
import { cn } from "@/lib/utils"; 

export function SidebarMore({ isCollapsed }: { isCollapsed: boolean }) {
  const [showPopup, setShowPopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState<number | undefined>(undefined);

  // ✅ Detect isMobile based on screen width
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // ✅ Get sidebar width (desktop only)
  useEffect(() => {
    if (containerRef.current && !isMobile) {
      setSidebarWidth(containerRef.current.offsetWidth);
    }
  }, [isCollapsed, isMobile]);

  // ✅ Close popup when clicked outside
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
// <<<<<<< HEAD
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

      {showPopup &&
        (isMobile ? (
          <div
            ref={popupRef}
            className="fixed top-18 right-4 z-50 bg-card rounded-md w-50"
          >
            <MoreLeftSidebar isCollapsed={false} />
          </div>
        ) : (
          <div
            ref={popupRef}
            className="absolute bottom-full mb-2 left-0 z-10 bg-[#2C2C2C] rounded-md shadow-lg transition-all duration-200"
            style={{ width: sidebarWidth }}
          >
            <MoreLeftSidebar isCollapsed={isCollapsed} />
          </div>
        ))}
    </div>
  );
}
