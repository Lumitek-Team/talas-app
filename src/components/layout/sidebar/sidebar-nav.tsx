"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { trpc } from "@/app/_trpc/client";
import { STALE } from "@/lib/query-config";
import { cn } from "@/lib/utils";
import { AuthPromptDialog } from "@/components/ui/auth-prompt-dialog";
import { useState } from "react";
import {
  HomeIcon,
  BookmarkIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  BookmarkIcon as BookmarkIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  BellIcon as BellIconSolid,
  UserIcon as UserIconSolid,
} from "@heroicons/react/24/solid";

interface NavItem {
  icon: string;
  label: string;
  href: string;
  /** If true, unauthenticated users see the auth-prompt dialog instead of navigating. */
  requiresAuth?: boolean;
}

interface SidebarNavProps {
  isCollapsed: boolean;
  activeItem?: string;
  isMobile?: boolean;
}

export function SidebarNav({
  isCollapsed,
  activeItem,
  isMobile = false,
}: SidebarNavProps) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const userId = user?.id;

  const { data } = trpc.user.getById.useQuery(
    { id: userId || "" },
    { enabled: !!userId, staleTime: STALE.LONG },
  );
  const username = data?.data?.username;

  const isUnRead = trpc.notification.getIsUnread.useQuery(
    { id_user: userId || "" },
    { enabled: !!userId, staleTime: STALE.SHORT, refetchInterval: 30 * 1000 },
  );

  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authDialogMessage, setAuthDialogMessage] = useState<
    string | undefined
  >(undefined);

  const navItems: NavItem[] = [
    { icon: "home", label: "Home", href: "/feeds" },
    {
      icon: "bookmark",
      label: "Saved projects",
      href: "/saved",
      requiresAuth: true,
    },
    { icon: "search", label: "Search", href: "/search" },
    {
      icon: "bell",
      label: "Notification",
      href: "/notifications",
      requiresAuth: true,
    },
    {
      icon: "user",
      label: "Profile",
      href: username ? `/profile/${username}` : "/feeds",
      requiresAuth: true,
    },
  ];

  const handleNavClick = (
    e: React.MouseEvent,
    item: NavItem,
  ) => {
    // If the item requires auth and the user is not signed in, intercept.
    if (item.requiresAuth && isLoaded && !user) {
      e.preventDefault();
      const messages: Record<string, string> = {
        bookmark: "Sign in to access your saved projects collection.",
        bell: "Sign in to see notifications about your activity.",
        user: "Sign in to view and manage your profile.",
      };
      setAuthDialogMessage(messages[item.icon]);
      setAuthDialogOpen(true);
    }
  };

  const renderIcon = (item: NavItem, isActive: boolean) => {
    switch (item.icon) {
      case "home":
        return isActive ? (
          <HomeIconSolid className="w-6 h-6" />
        ) : (
          <HomeIcon className="w-6 h-6" />
        );
      case "bookmark":
        return isActive ? (
          <BookmarkIconSolid className="w-6 h-6" />
        ) : (
          <BookmarkIcon className="w-6 h-6" />
        );
      case "search":
        return isActive ? (
          <MagnifyingGlassIconSolid className="w-6 h-6" />
        ) : (
          <MagnifyingGlassIcon className="w-6 h-6" />
        );
      case "bell":
        return isActive ? (
          <BellIconSolid className="w-6 h-6" />
        ) : (
          <span className="relative">
            <BellIcon className="w-6 h-6" />
            {isUnRead.data?.data && (
              <span className="absolute top-0 right-0 block w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </span>
        );
      case "user":
        return isActive ? (
          <UserIconSolid className="w-6 h-6" />
        ) : (
          <UserIcon className="w-6 h-6" />
        );
      default:
        return null;
    }
  };

  if (isMobile) {
    return (
      <>
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
                    onClick={(e) => handleNavClick(e, item)}
                    className={cn(
                      "flex items-center justify-center p-2 rounded-md",
                      isActive ? "text-primary" : "text-white hover:bg-white/10",
                    )}
                    title={item.label}
                  >
                    {renderIcon(item, isActive)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <AuthPromptDialog
          isOpen={authDialogOpen}
          onClose={() => setAuthDialogOpen(false)}
          message={authDialogMessage}
        />
      </>
    );
  }

  return (
    <>
      <nav>
        <ul className="flex flex-col gap-y-2">
          {navItems.map((item) => {
            const isActive = activeItem
              ? item.label.toLowerCase() === activeItem.toLowerCase()
              : pathname === item.href;

            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    "flex items-center gap-3 w-full px-6 py-4 text-base font-medium rounded-md",
                    isCollapsed ? "justify-center" : "",
                    isActive
                      ? "text-primary"
                      : "text-white hover:bg-white/10",
                  )}
                  title={isCollapsed ? item.label : ""}
                >
                  {renderIcon(item, isActive)}
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <AuthPromptDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
        message={authDialogMessage}
      />
    </>
  );
}
