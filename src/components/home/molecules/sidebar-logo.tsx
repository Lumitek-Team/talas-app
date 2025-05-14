"use client";

import Link from "next/link";
import Image from "next/image";

export function SidebarLogo() {
  return (
    <div className="px-6">
      <Link href="/" className="flex items-center gap-x-3">
        <Image 
          src="/logo/talas-logo.png"
          alt="Talas Logo"
          width={35}
          height={35}
          className="object-contain"
        />
        <span className="text-xl font-medium text-white">
          talas
        </span>
      </Link>
    </div>
  );
}