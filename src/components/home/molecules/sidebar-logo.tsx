"use client";

import Link from "next/link";

export function SidebarLogo() {
  return (
    <div className="px-6">
      <Link href="/" className="flex items-center gap-x-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 bg-white"></div>
            <div className="w-2.5 h-2.5 bg-white"></div>
          </div>
          <div className="flex gap-0.5">
            <div className="w-2.5 h-2.5 bg-white"></div>
            <div className="w-2.5 h-2.5 bg-white"></div>
          </div>
        </div>
        <span className="text-xl font-medium text-white">
          talas
        </span>
      </Link>
    </div>
  );
}