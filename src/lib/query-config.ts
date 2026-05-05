/**
 * Centralized TanStack Query cache configuration.
 *
 * Use these constants to set `staleTime` on every `useQuery` /
 * `useInfiniteQuery` call so we have a single source of truth and can tune
 * caching globally without hunting through the whole codebase.
 *
 * Rule of thumb:
 *   STATIC  – reference data that almost never changes (categories)
 *   LONG    – user-specific data that changes during a session (profiles)
 *   MEDIUM  – social/feed content that changes as others post
 *   SHORT   – near-real-time data (notification badges)
 */
export const STALE = {
  /** Reference data – cache indefinitely, only invalidated on mutation */
  STATIC: Infinity,
  /** User / project detail data – fresh for 5 minutes */
  LONG: 5 * 60 * 1000,
  /** Feed / social content – fresh for 1 minute */
  MEDIUM: 60 * 1000,
  /** Notification badges and unread counts – fresh for 15 seconds */
  SHORT: 15 * 1000,
} as const;
