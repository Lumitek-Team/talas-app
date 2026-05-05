"use client";

/**
 * RouteGuard / AuthGuard
 *
 * Hard redirect for routes that require authentication.
 * Only used for account-specific pages:
 *   - /saved
 *   - /notifications
 *   - /settings  (and /settings/archive)
 *   - /create-project
 *   - /profile/[username]/edit  (handled at the page level)
 *
 * Guest-browsable pages (feeds, project detail, search) must NOT wrap
 * their layouts with this component.
 */

import { useAuth } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingSpinner } from "@/components/ui/loading";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
    }
  }, [isLoaded, isSignedIn, pathname, router]);

  if (!isLoaded || !isSignedIn) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  return <>{children}</>;
}
