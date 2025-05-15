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
    // Function to check window width and update sidebar state
    const handleResize = () => {
      setIsCollapsed(window.innerWidth <= 990);
    };

    // Set initial state
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <aside 
      className={`h-screen bg-background fixed left-0 top-0 flex flex-col justify-between py-12 border-r border-white/10 ${
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
  );
}