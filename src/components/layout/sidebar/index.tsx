"use client";

import { useEffect, useState } from "react";
import { SidebarLogo } from "./sidebar-logo";
import { SidebarNav } from "./sidebar-nav";
import { SidebarMore } from "./sidebar-more";

interface SidebarProps {
  activeItem?: string;
}

export function Sidebar({ activeItem }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth <= 1180);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Layout - Handled via CSS visibility to prevent blink */}
      <div className="min-[691px]:hidden">
        {/* Top bar for mobile */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-background flex items-center justify-between px-4 z-50 border-b-2 border-white/10">
          <div className="flex-1"></div>
          <div className="flex justify-center">
            <SidebarLogo isCollapsed={true} />
          </div>
          <div className="flex-1 flex justify-end">
            <SidebarMore isCollapsed={true} />
          </div>
        </div>
        
        {/* Bottom navigation for mobile */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-background flex items-center justify-evenly z-50 border-t-2 border-white/10">
          <SidebarNav isCollapsed={true} activeItem={activeItem} isMobile={true} />
        </div>
      </div>

      {/* Desktop Layout - Handled via CSS visibility to prevent blink */}
      <aside 
        className={`max-[690px]:hidden h-screen bg-background fixed left-0 top-0 flex flex-col justify-between py-7 z-50 transition-all duration-300 ${
          isCollapsed ? "w-[70px] items-center px-0" : "w-[270px] px-4"
        }`}
      >
        {/* Logo section */}
        <SidebarLogo isCollapsed={isCollapsed} />

        {/* Navigation section */}
        <SidebarNav isCollapsed={isCollapsed} activeItem={activeItem} />

        {/* More button section */}
        <SidebarMore isCollapsed={isCollapsed} />
      </aside>
    </>
  );
}