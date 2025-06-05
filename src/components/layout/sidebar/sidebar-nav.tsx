"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  HomeIcon, 
  BookmarkIcon, 
  MagnifyingGlassIcon, 
  BellIcon, 
  UserIcon 
} from "@heroicons/react/24/outline";
import { 
  HomeIcon as HomeIconSolid, 
  BookmarkIcon as BookmarkIconSolid, 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid, 
  BellIcon as BellIconSolid, 
  UserIcon as UserIconSolid 
} from "@heroicons/react/24/solid";

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

interface SidebarNavProps {
  isCollapsed: boolean;
  activeItem?: string;
  isMobile?: boolean;
}

export function SidebarNav({ isCollapsed, activeItem, isMobile = false }: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const username = user?.username || (email ? email.split("@")[0] : null);
  const profileHref = username ? `/profile/${username}` : "/";

  
  
  const navItems: NavItem[] = [
    { icon: "home", label: "Home", href: "/feeds" },
    { icon: "bookmark", label: "Saved projects", href: "/saved" },
    { icon: "search", label: "Search", href: "/search" },
    { icon: "bell", label: "Notification", href: "/notifications" },
    { icon: "user", label: "Profile", href: profileHref },
  ];

  if (isMobile) {
    return (
      <nav className="w-full">
        <ul className="flex justify-evenly w-full">
          {navItems.map((item) => {
            const isActive = activeItem 
              ? item.label.toLowerCase() === activeItem.toLowerCase() 
              : pathname === item.href;
              
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-center p-2 rounded-md transition-colors ${
                    isActive ? "text-primary" : "text-white hover:bg-white/10"
                  }`}
                  title={item.label}
                >
                  {item.icon === "home" && (
                    isActive ? (
                      <HomeIconSolid className="w-6 h-6" />
                    ) : (
                      <HomeIcon className="w-6 h-6" />
                    )
                  )}
                  {item.icon === "bookmark" && (
                    isActive ? (
                      <BookmarkIconSolid className="w-6 h-6" />
                    ) : (
                      <BookmarkIcon className="w-6 h-6" />
                    )
                  )}
                  {item.icon === "search" && (
                    isActive ? (
                      <MagnifyingGlassIconSolid className="w-6 h-6" />
                    ) : (
                      <MagnifyingGlassIcon className="w-6 h-6" />
                    )
                  )}
                  {item.icon === "bell" && (
                    isActive ? (
                      <BellIconSolid className="w-6 h-6" />
                    ) : (
                      <BellIcon className="w-6 h-6" />
                    )
                  )}
                  {item.icon === "user" && (
                    isActive ? (
                      <UserIconSolid className="w-6 h-6" />
                    ) : (
                      <UserIcon className="w-6 h-6" />
                    )
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  return (
    <nav>
      <ul className="flex flex-col gap-y-2">
        {navItems.map((item) => {
          // Check if this item is active based on either:
          // 1. The explicitly passed activeItem prop, or
          // 2. The current pathname if no activeItem is provided
          const isActive = activeItem 
            ? item.label.toLowerCase() === activeItem.toLowerCase() 
            : pathname === item.href;
            
          return (
            <li key={item.label}>
              <Link
                href={item.href}
                className={`flex items-center ${isCollapsed ? "justify-center" : ""} gap-3 w-full px-6 py-4 text-base font-medium transition-tranformation duration-200 active:scale-90 ${
                  isActive ? "text-primary" : "text-white hover:bg-white/10"
                } rounded-md`}
                title={isCollapsed ? item.label : ""}
              >
                {item.icon === "home" && (
                  isActive ? (
                    <HomeIconSolid className="w-6 h-6" />
                  ) : (
                    <HomeIcon className="w-6 h-6" />
                  )
                )}
                {item.icon === "bookmark" && (
                  isActive ? (
                    <BookmarkIconSolid className="w-6 h-6" />
                  ) : (
                    <BookmarkIcon className="w-6 h-6" />
                  )
                )}
                {item.icon === "search" && (
                  isActive ? (
                    <MagnifyingGlassIconSolid className="w-6 h-6" />
                  ) : (
                    <MagnifyingGlassIcon className="w-6 h-6" />
                  )
                )}
                {item.icon === "bell" && (
                  isActive ? (
                    <BellIconSolid className="w-6 h-6" />
                  ) : (
                    <BellIcon className="w-6 h-6" />
                  )
                )}
                {item.icon === "user" && (
                  isActive ? (
                    <UserIconSolid className="w-6 h-6" />
                  ) : (
                    <UserIcon className="w-6 h-6" />
                  )
                )}

                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}