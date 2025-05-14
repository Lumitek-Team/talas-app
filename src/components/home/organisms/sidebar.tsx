"use client";

import { SidebarLogo } from "../molecules/sidebar-logo";
import { SidebarNav } from "../molecules/sidebar-nav";
import { SidebarMore } from "../molecules/sidebar-more";

export function Sidebar() {
  return (
    <aside className="w-[270px] h-screen bg-background fixed left-0 top-0 flex flex-col justify-between py-12 px-4 border-r border-white/10">
      {/* Logo section */}
      <SidebarLogo />

      {/* Navigation section */}
      <SidebarNav />

      {/* More button section */}
      <SidebarMore />
    </aside>
  );
}