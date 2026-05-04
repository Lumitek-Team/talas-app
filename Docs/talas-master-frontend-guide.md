# Talas App — Master Frontend Production Guide

**Role:** Frontend Engineer
**Stack:** Next.js 19 (App Router) · tRPC (App Router API) · TanStack Query v5 · Zustand · Clerk · Tailwind · shadcn/ui · Framer Motion · Vitest · RTL · Playwright
**Timeline:** 5-day deployment plan (May 1–7, 2026) + post-launch polish

> This is the single source of truth for making Talas production-ready on the frontend. Every pattern here reflects current (2025–2026) professional standards. Read the corrections section first — they prevent critical runtime failures.

---

## Part 0 — Architecture & Stack Corrections (Read Before Writing Any Code)

### Correction 1 — tRPC App Router Client Setup

The App Router uses `createTRPCReact`, not `createTRPCNext`. These are different packages. Using the wrong one causes silent runtime failures.

```typescript
// src/_trpc/client.ts
import { createTRPCReact } from "@trpc/react-query"; // NOT @trpc/next
import type { AppRouter } from "@/app/server";

export const trpc = createTRPCReact<AppRouter>();
```

```typescript
// src/_trpc/Provider.tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { useState } from "react";
import { trpc } from "./client";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 60 seconds — no redundant refetches during that window
        staleTime: 60 * 1000,
        // Keep unused cache in memory for 5 minutes after component unmounts
        gcTime: 5 * 60 * 1000,
        // Don't refetch just because the user switched browser tabs and came back
        refetchOnWindowFocus: false,
        // One retry on failure is enough — don't hammer a struggling server
        retry: 1,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000), // exponential backoff
      },
    },
  });
}

// Singleton pattern: avoid creating a new QueryClient on every render
let browserQueryClient: QueryClient | undefined;

function getQueryClient() {
  if (typeof window === "undefined") {
    // Server: always create a new client (no shared state between requests)
    return makeQueryClient();
  }
  // Browser: reuse existing client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

export function TrpcProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: "/api/trpc",
          // Clerk manages auth via cookies in Next.js — no manual header injection needed
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

### Correction 2 — TanStack Query v5 API Changes

v5 has breaking changes from v4. Using the wrong API causes silent bugs or type errors.

| What you're doing       | v4 (wrong)                     | v5 (correct)                                    |
| ----------------------- | ------------------------------ | ----------------------------------------------- |
| Cache time config       | `cacheTime`                    | `gcTime`                                        |
| Mutation loading state  | `isLoading`                    | `isPending`                                     |
| Query not-yet-fetched   | `status === 'loading'`         | `status === 'pending'`                          |
| Callbacks in `useQuery` | `onSuccess`, `onError` options | Removed — use `useEffect` or mutation callbacks |

### Correction 3 — Mental Model for tRPC

This is not a REST API project. Every data interaction goes through tRPC procedures:

```
// WRONG — never do this
const res = await fetch("/api/projects");

// CORRECT — always use tRPC hooks
const { data } = trpc.project.getAll.useQuery();
```

tRPC = your type contract + HTTP transport + TanStack Query cache key, all unified. Breaking out of it loses type safety and cache coherence.

---

## Part 1 — Pre-Flight Checklist

Run these before touching any code. Establish a baseline.

```bash
# Confirm Node version — Next.js 19 requires 18.17+
node -v

# Clean install
rm -rf node_modules .next
npm install

# Document baseline errors — do not fix yet, just count them
npx tsc --noEmit 2>&1 | tee baseline-ts-errors.txt
npm run lint 2>&1 | tee baseline-lint-errors.txt

# Confirm dev server starts
npm run dev
```

Confirm these files exist:

| File                     | Purpose                        |
| ------------------------ | ------------------------------ |
| `src/middleware.ts`      | Clerk route protection         |
| `src/_trpc/client.ts`    | tRPC React client              |
| `src/_trpc/Provider.tsx` | TanStack Query + tRPC provider |
| `src/app/layout.tsx`     | Root layout with all providers |
| `.env.local`             | Local environment variables    |

---

## Part 2 — Day 1: Foundation (Friday, May 1)

**Goal:** Connect to new Clerk + Supabase accounts, remove all legacy auth components, verify clean local run.

---

### 2.1 Environment Variables

Get the new keys from your friend and populate `.env.local`:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Clerk redirect configuration (required for App Router)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/feed
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Supabase (storage only — your friend owns the DB connection string)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# App base URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

After updating, restart the dev server. Zero "Missing environment variable" errors is the target.

---

### 2.2 Middleware — Route Protection

`src/middleware.ts` is the security boundary for all routes. This runs on the Edge before any page renders.

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/feed(.*)",
  "/profile/settings(.*)", // settings requires auth
  "/project/new(.*)", // creating requires auth
  "/notifications(.*)",
  "/onboarding(.*)",
]);

// Public profile and project view — recruiters must access without login
const isPublicRoute = createRouteMatcher([
  "/",
  "/profile/(.*)", // viewing profiles is public
  "/project/((?!new).*)", // viewing projects is public, creating is not
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) {
    auth().protect({
      // Redirect to sign-in with return URL so user lands back after auth
      unauthenticatedUrl: `${req.nextUrl.origin}/sign-in?redirect_url=${req.nextUrl.pathname}`,
    });
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jte?|tty|svg|webp|png|jpg|jpeg|gif|ico|woff2?|eot|ttf|otf)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

Key design decisions:

- Public profile pages are intentionally accessible — recruiters viewing your project as a visitor must not hit a login wall
- `/api/trpc` is in the matcher so Clerk injects user context into every tRPC call

---

### 2.3 Root Layout — Provider Order

Provider nesting order matters. ClerkProvider must be outermost because tRPC context reads the Clerk session.

```typescript
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { TrpcProvider } from "@/_trpc/Provider";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "sonner";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // prevent invisible text during font load
});

export const metadata: Metadata = {
  title: {
    default: "Talas — Portfolio for Creators",
    template: "%s | Talas",
  },
  description: "Showcase your work, document your process, collaborate with other creators.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://talas-app.vercel.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body>
        <ClerkProvider>
          <TrpcProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              {children}
              <Toaster position="bottom-right" richColors closeButton />
            </ThemeProvider>
          </TrpcProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
```

---

### 2.4 Remove Legacy Auth Components

Scan for dead code:

```bash
# Old auth patterns
grep -rn "useSession\|SessionProvider\|next-auth\|getServerSession" src/ --include="*.tsx" --include="*.ts"

# Raw fetch calls that bypass tRPC
grep -rn "fetch\('/api\|axios\." src/ --include="*.tsx" --include="*.ts"

# Hardcoded old URLs
grep -rn "localhost:8000\|localhost:5000\|localhost:3001" src/ --include="*.tsx" --include="*.ts"
```

Replace any found patterns with their Clerk equivalents:

```typescript
// Clerk components reference
import {
  SignInButton, // Trigger sign-in modal or redirect
  SignUpButton, // Trigger sign-up
  SignedIn, // Render only when authenticated
  SignedOut, // Render only when NOT authenticated
  UserButton, // Avatar dropdown with sign-out
  useUser, // { user, isLoaded, isSignedIn }
  useAuth, // { userId, isLoaded, isSignedIn, getToken }
  currentUser, // Server-side: async function, use in Server Components
} from "@clerk/nextjs";
```

---

### 2.5 Visual Theme Audit Checklist

Check in browser with Chrome DevTools open (Console + Network tabs):

- [ ] No 404 errors in Network tab
- [ ] No JavaScript errors in Console
- [ ] Fonts load correctly — no flash of system font fallback
- [ ] Dark mode toggle works on every page
- [ ] Mobile viewport (393px — iPhone 14 Pro) — no horizontal scroll, no broken layouts
- [ ] shadcn/ui CSS variables defined in `src/app/globals.css`

---

### Day 1 Definition of Done

- [ ] `.env.local` fully populated with new keys
- [ ] `npm run dev` — zero console errors
- [ ] Sign in / sign up / sign out flows work locally
- [ ] No legacy auth imports remain in codebase
- [ ] Mobile viewport — no broken layouts

---

## Part 3 — Day 2: Launch (Monday, May 4)

**Goal:** Fix every production-build-only error, configure Vercel correctly, deploy, and smoke test.

---

### 3.1 Security Headers (Missing from Most Portfolios)

Add to `next.config.js` before doing anything else. These headers protect against clickjacking, MIME sniffing, and information leakage. Recruiters who know security will check for these.

```javascript
// next.config.js
const securityHeaders = [
  // Prevent search engines from indexing preview deployments
  // Remove this on your main production domain
  // { key: "X-Robots-Tag", value: "noindex" },

  // Prevent your app from being embedded in iframes (clickjacking protection)
  { key: "X-Frame-Options", value: "DENY" },

  // Prevent browsers from guessing content types (MIME sniffing attacks)
  { key: "X-Content-Type-Options", value: "nosniff" },

  // Control referrer information sent to external sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

  // Disable browser features you don't use
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },

  // DNS prefetch for performance
  { key: "X-DNS-Prefetch-Control", value: "on" },

  // Content Security Policy — adjust allowed sources to match your actual domains
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.talas-app.com", // Clerk needs unsafe-eval
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https://*.supabase.co https://img.clerk.com",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co https://clerk.talas-app.com wss://*.supabase.co",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com", // Clerk user avatars
      },
    ],
    formats: ["image/avif", "image/webp"], // modern formats — smaller files
  },
  // Remove console.log in production builds
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
};

module.exports = nextConfig;
```

---

### 3.2 Run Production Build Locally First

Never deploy without confirming a clean local build:

```bash
npm run build
```

**Common App Router build errors and fixes:**

**"You're importing a component that needs X. That only works in a Client Component"**
Add `"use client"` at the top of that file, or split the interactive part into its own client component.

**"Hydration failed because the initial UI does not match"**
The server rendered different HTML than the client expected. Common cause: rendering based on browser-only values before hydration.

```typescript
// Pattern to safely use browser-only state
const [isMounted, setIsMounted] = useState(false);
useEffect(() => setIsMounted(true), []);
if (!isMounted) return <Skeleton className="h-8 w-32" />;
```

**"Error: Missing 'key' prop"**
Every `.map()` needs a stable `key`. Use the ULID from your database — never use the array index.

```typescript
// Wrong
{projects.map((p, i) => <ProjectCard key={i} project={p} />)}

// Correct
{projects.map((p) => <ProjectCard key={p.id} project={p} />)}
```

---

### 3.3 "use client" Boundary Strategy

The most common performance mistake in vibe-coded Next.js apps is adding `"use client"` everywhere. The professional pattern is to push the client boundary as far down the component tree as possible.

```typescript
// WRONG — entire feed is client-rendered, losing all SSR benefits
"use client";
export default function FeedPage() {
  const { data } = trpc.project.getFeed.useQuery();
  return <div>{data?.map(...)}</div>;
}

// CORRECT — page is a Server Component, only interactive leaf nodes are client
// src/app/(pages)/feed/page.tsx — Server Component (no "use client")
import { ProjectFeed } from "@/components/project/project-feed";
import { FeedFilters } from "@/components/project/feed-filters"; // "use client" inside

export default function FeedPage() {
  return (
    <main className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Discover</h1>
      <FeedFilters />       {/* client component — has interactive filter state */}
      <ProjectFeed />       {/* client component — has tRPC query */}
    </main>
  );
}
```

Rule of thumb: if a component has no `onClick`, `useState`, `useEffect`, or browser API — it does not need `"use client"`.

---

### 3.4 Vercel Deployment Configuration

1. Import GitHub repo at vercel.com/new
2. Framework: Next.js (auto-detected)
3. Add every environment variable from `.env.local` to Vercel's dashboard

Environment variable scoping:

| Variable           | Production | Preview                   | Development |
| ------------------ | ---------- | ------------------------- | ----------- |
| `NEXT_PUBLIC_*`    | Yes        | Yes                       | Yes         |
| `CLERK_SECRET_KEY` | Yes        | Yes                       | No          |
| `DATABASE_URL`     | Yes        | No (your friend controls) | No          |

---

### 3.5 Smoke Test After Deploy

Test in order — if step N fails, fix it before testing step N+1:

1. Landing page loads, no console errors
2. Sign up with a new test account
3. Sign in with that account
4. Visit `/feed` while logged out — confirm redirect to `/sign-in`
5. Feed loads — check Network tab for `/api/trpc/*` returning 200
6. Create a project end-to-end
7. Sign out — confirm redirect to `/`
8. Check security headers: visit `https://securityheaders.com` with your live URL

---

### Day 2 Definition of Done

- [ ] `npm run build` — zero errors, zero warnings about missing keys
- [ ] Live URL accessible and all 8 smoke tests pass
- [ ] `securityheaders.com` gives at minimum a B rating
- [ ] `console.log` statements removed from production build

---

## Part 4 — Day 3: Performance (Tuesday, May 5)

**Goal:** Eliminate auth flickering, implement proper TanStack Query cache strategy, add server-side prefetching for public pages, stable Framer Motion transitions.

---

### 4.1 Fix Auth Flickering

Flickering = page briefly shows unauthenticated UI before Clerk loads. This looks broken.

**Root cause:** `useUser()` starts with `isLoaded: false`. Rendering before checking it causes a flash.

```typescript
// src/components/layout/navbar-actions.tsx
"use client";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";

// SignedIn/SignedOut from Clerk handle the isLoaded check internally
// Use these for simple show/hide cases — they suppress flash automatically
export function NavbarActions() {
  return (
    <div className="flex items-center gap-3">
      <SignedOut>
        <SignInButton mode="modal">
          <button className="btn-outline">Sign In</button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
    </div>
  );
}
```

For custom components that need the user object:

```typescript
"use client";
import { useUser } from "@clerk/nextjs";
import { ProfileHeaderSkeleton } from "./profile-header-skeleton";

export function ProfileHeader() {
  const { user, isLoaded } = useUser();

  // Always gate on isLoaded first — never render based on undefined user
  if (!isLoaded) return <ProfileHeaderSkeleton />;
  if (!user) return null;

  return (
    <div className="flex items-center gap-4">
      <img
        src={user.imageUrl}
        alt={user.fullName ?? "User avatar"}
        className="h-12 w-12 rounded-full"
      />
      <div>
        <p className="font-semibold">{user.fullName}</p>
        <p className="text-sm text-muted-foreground">@{user.username}</p>
      </div>
    </div>
  );
}
```

---

### 4.2 Client-Side Auth Guard

Middleware handles server-level protection. This guard handles client-side navigation and prefetching edge cases.

```typescript
// src/components/layout/auth-guard.tsx
"use client";
import { useAuth } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { FullPageSpinner } from "@/components/ui/full-page-spinner";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
    }
  }, [isLoaded, isSignedIn, router, pathname]);

  // Show nothing while Clerk checks session — no flash of protected content
  if (!isLoaded || !isSignedIn) return <FullPageSpinner />;

  return <>{children}</>;
}
```

```typescript
// src/app/(pages)/feed/layout.tsx
import { AuthGuard } from "@/components/layout/auth-guard";

export default function FeedLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
```

---

### 4.3 TanStack Query Cache Strategy

This is the highest-impact performance lever on the client. The goal: **never make a network request for data the client already has.**

The `staleTime` controls how long data is considered fresh. During that window, the same query from any component returns the cached result instantly — zero network request.

**Define per-query cache strategy based on how often data changes:**

```typescript
// src/lib/query-config.ts
// Centralize stale times so they're easy to tune

export const STALE = {
  // Static reference data — rarely changes, cache indefinitely
  STATIC: Infinity,

  // User-specific data — changes during a session but not constantly
  LONG: 5 * 60 * 1000, // 5 minutes

  // Feed / social content — changes frequently as others post
  MEDIUM: 60 * 1000, // 1 minute

  // Notifications / real-time — needs to stay fresh
  SHORT: 10 * 1000, // 10 seconds

  // Always fresh — disable caching (use sparingly, has performance cost)
  NONE: 0,
} as const;
```

Apply per query:

```typescript
// Categories — barely ever change
const { data: categories } = trpc.category.getAll.useQuery(undefined, {
  staleTime: STALE.STATIC,
});

// Project feed — people post new things, refresh every minute
const { data: feed } = trpc.project.getFeed.useQuery(
  { filter: activeFilter, cursor: undefined },
  { staleTime: STALE.MEDIUM },
);

// Single project detail — cache for 5 minutes, recruiter is reading
const { data: project } = trpc.project.getById.useQuery(
  { id: projectId },
  { staleTime: STALE.LONG },
);

// Unread notification count — keep fresh so badge is accurate
const { data: unreadCount } = trpc.notification.getUnreadCount.useQuery(
  undefined,
  {
    staleTime: STALE.SHORT,
    refetchInterval: 30 * 1000, // poll every 30s as a fallback to Supabase Realtime
  },
);
```

---

### 4.4 Server-Side Prefetching for Public Pages

This is what separates a "Next.js app" from a "Next.js app that leverages Next.js." Public pages (project detail, user profile) should arrive at the client with data already resolved — zero loading state, instant render, perfect for SEO and recruiter impressions.

```typescript
// src/app/(pages)/project/[id]/page.tsx — Server Component
import { createServerSideHelpers } from "@trpc/react-query/server";
import { appRouter } from "@/app/server";
import { createContext } from "@/app/server/context";
import superjson from "superjson";
import { HydrationBoundary, dehydrate } from "@tanstack/react-query";
import { ProjectDetailView } from "@/components/project/project-detail-view";
import { generateMetadata as genMeta } from "./metadata"; // see SEO section
import { notFound } from "next/navigation";

export { genMeta as generateMetadata };

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: await createContext({ isServer: true }), // unauthenticated server context
    transformer: superjson,
  });

  // Prefetch the project — if not found, show 404 immediately
  const project = await helpers.project.getById.fetch({ id: params.id }).catch(() => null);
  if (!project) notFound();

  // Prefetch related data in parallel
  await Promise.all([
    helpers.comment.getByProjectId.prefetch({ projectId: params.id }),
    helpers.project.getRelated.prefetch({ projectId: params.id, categoryId: project.categoryId }),
  ]);

  return (
    // Pass prefetched cache to client — components read from cache instantly
    <HydrationBoundary state={dehydrate(helpers.queryClient)}>
      <ProjectDetailView projectId={params.id} />
    </HydrationBoundary>
  );
}
```

The client component then uses the same tRPC query — it hits the cache, not the network:

```typescript
// src/components/project/project-detail-view.tsx
"use client";
import { trpc } from "@/_trpc/client";
import { STALE } from "@/lib/query-config";

export function ProjectDetailView({ projectId }: { projectId: string }) {
  // Cache was already populated server-side — this renders instantly, no spinner
  const { data: project } = trpc.project.getById.useQuery(
    { id: projectId },
    { staleTime: STALE.LONG }
  );

  // project is guaranteed to exist here (server would have 404'd otherwise)
  return <div>{project?.title}</div>;
}
```

Apply the same pattern to user profile pages (`/profile/[username]`).

---

### 4.5 Consistent tRPC Query State Handling

Every query must handle all three states. Build reusable error/empty components once:

```typescript
// src/components/ui/query-states.tsx
export function QueryError({ message = "Something went wrong. Try refreshing." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}

export function QueryEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
```

Standard usage pattern for every query:

```typescript
"use client";
import { trpc } from "@/_trpc/client";
import { ProjectCardSkeleton } from "./project-card-skeleton";
import { QueryError, QueryEmpty } from "@/components/ui/query-states";
import { STALE } from "@/lib/query-config";

export function ProjectFeed() {
  const { data: projects, isPending, isError } = trpc.project.getFeed.useQuery(
    undefined,
    { staleTime: STALE.MEDIUM }
  );

  if (isPending) return <ProjectFeedSkeleton />;    // isPending = no data in cache yet
  if (isError) return <QueryError />;
  if (!projects?.length) return <QueryEmpty message="No projects yet. Be the first to post." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
```

Run this to find every query that needs to be audited:

```bash
grep -rn "\.useQuery\|\.useInfiniteQuery" src/ --include="*.tsx" -l
```

Open each file, verify all three states are handled.

---

### 4.6 Stable Framer Motion Transitions

Transitions must not cause layout shifts. Keep duration short — anything above 250ms feels slow in a UI context.

```typescript
// src/components/layout/page-transition.tsx
"use client";
import { motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }} // Material Design easing
    >
      {children}
    </motion.div>
  );
}
```

For like/bookmark micro-animations:

```typescript
// Scale pulse on interact — satisfying feedback, zero layout shift
<motion.button
  whileTap={{ scale: 0.88 }}
  transition={{ duration: 0.1 }}
  onClick={handleLike}
>
  <Heart className={cn("h-5 w-5", isLiked && "fill-red-500 text-red-500")} />
</motion.button>
```

---

### Day 3 Definition of Done

- [ ] Sign in → protected page shows zero content flash before auth resolves
- [ ] Project detail page loads with zero spinner on first visit (server prefetch working)
- [ ] Every tRPC query has skeleton, error, and empty states
- [ ] Page transitions run at 60fps — verified in Chrome Performance tab
- [ ] CLS (Cumulative Layout Shift) score is 0 on Lighthouse

---

## Part 5 — Day 4: Reliability (Wednesday, May 6)

**Goal:** Image optimization, XSS protection for rich text, error boundaries, mutation error handling.

---

### 5.1 Replace Every `<img>` Tag

```bash
grep -rn "<img " src/ --include="*.tsx"
```

```typescript
import Image from "next/image";

// For images with known dimensions
<Image
  src={project.thumbnailUrl}
  alt={project.title}       // descriptive alt text — not empty string
  width={800}
  height={450}
  className="rounded-lg object-cover"
  // priority={true}        // add ONLY for the first visible image (hero/above fold)
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>

// For images that fill their container (responsive cards)
<div className="relative aspect-video w-full overflow-hidden rounded-lg">
  <Image
    src={project.thumbnailUrl}
    alt={project.title}
    fill
    className="object-cover"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  />
</div>
```

The `sizes` prop is not optional. Without it, Next.js sends the largest image to every device. With it, mobile gets a small file — directly improves LCP.

---

### 5.2 XSS Protection for CKEditor Output

CKEditor lets users write arbitrary HTML. Rendering it without sanitization is a critical XSS vulnerability — a user could inject `<script>` tags that execute for every visitor.

```bash
npm install dompurify
npm install --save-dev @types/dompurify
```

```typescript
// src/lib/sanitize-html.ts
import type { Config } from "dompurify";

// Allowlist — only these tags and attributes pass through
const SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS: [
    "p",
    "br",
    "strong",
    "em",
    "u",
    "s",
    "h2",
    "h3",
    "h4",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "a",
    "img",
    "figure",
    "figcaption",
  ],
  ALLOWED_ATTR: [
    "href",
    "target",
    "rel", // links
    "src",
    "alt",
    "width",
    "height", // images
    "class", // for CKEditor formatting classes
  ],
  // Force all links to open in new tab with noopener (prevents tab hijacking)
  ADD_ATTR: ["target"],
  FORCE_BODY: true,
};

export function sanitizeHtml(dirty: string): string {
  // DOMPurify only runs in the browser
  if (typeof window === "undefined") {
    // Server-side: return empty string — content will hydrate correctly client-side
    return "";
  }
  const DOMPurify = require("dompurify");
  const clean = DOMPurify.sanitize(dirty, SANITIZE_CONFIG);

  // Force external links to noopener noreferrer after sanitization
  return clean.replace(/<a /g, '<a rel="noopener noreferrer" ');
}
```

```typescript
// src/components/project/project-content.tsx
"use client";
import { sanitizeHtml } from "@/lib/sanitize-html";
import { useState, useEffect } from "react";

export function ProjectContent({ html }: { html: string }) {
  const [cleanHtml, setCleanHtml] = useState("");

  useEffect(() => {
    // Run sanitization client-side after mount
    setCleanHtml(sanitizeHtml(html));
  }, [html]);

  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
```

---

### 5.3 Client-Side Image Compression

Before uploading to Supabase, compress images in the browser. This protects your storage quota and speeds up uploads on mobile networks.

```bash
npm install browser-image-compression
```

```typescript
// src/lib/compress-image.ts
import imageCompression from "browser-image-compression";

export async function compressImage(
  file: File,
  options?: { maxSizeMB?: number; maxWidthOrHeight?: number },
): Promise<File> {
  const config = {
    maxSizeMB: options?.maxSizeMB ?? 1,
    maxWidthOrHeight: options?.maxWidthOrHeight ?? 1920,
    useWebWorker: true, // non-blocking — won't freeze the UI
    fileType: "image/webp", // WebP is ~30% smaller than JPEG at same quality
    initialQuality: 0.8,
  };

  try {
    const compressed = await imageCompression(file, config);
    console.info(
      `Compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressed.size / 1024 / 1024).toFixed(2)}MB`,
    );
    return compressed;
  } catch {
    // Fallback to original — never block the upload
    return file;
  }
}
```

```typescript
// src/lib/upload-image.ts
import { createClient } from "@/lib/supabase";
import { compressImage } from "./compress-image";

export async function uploadProjectImage(
  file: File,
  projectId: string,
): Promise<string> {
  const compressed = await compressImage(file);

  // Generate collision-resistant filename
  const extension = "webp";
  const filename = `${projectId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const supabase = createClient();
  const { error } = await supabase.storage
    .from("project-images")
    .upload(filename, compressed, {
      contentType: "image/webp",
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("project-images").getPublicUrl(filename);

  return publicUrl;
}
```

---

### 5.4 Error Boundaries

Without error boundaries, a single component crash takes down the entire page. With them, only the failing section shows an error state.

```typescript
// src/components/ui/error-boundary.tsx
"use client";
import { Component, type ReactNode } from "react";
import * as Sentry from "@sentry/nextjs"; // see post-launch section

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    Sentry.captureException(error);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <DefaultErrorFallback />;
    }
    return this.props.children;
  }
}

function DefaultErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
      <p className="text-sm font-medium text-destructive">Failed to load this section.</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-3 text-sm underline text-muted-foreground"
      >
        Refresh page
      </button>
    </div>
  );
}
```

Route-level error handling via Next.js convention:

```typescript
// src/app/(pages)/feed/error.tsx
"use client";
export default function FeedError({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <h2 className="text-lg font-semibold">Feed failed to load</h2>
      <p className="text-sm text-muted-foreground">This is likely a temporary issue.</p>
      <button onClick={reset} className="btn-primary">Try again</button>
    </div>
  );
}
```

Wrap high-risk sections:

```typescript
<ErrorBoundary fallback={<FeedErrorState />}>
  <ProjectFeed />
</ErrorBoundary>

<ErrorBoundary>
  <CommentSection projectId={id} />
</ErrorBoundary>
```

---

### 5.5 Mutation Error Handling with Toast Feedback

Every mutation needs `onSuccess` and `onError`. Silent failures are not acceptable in production.

```typescript
"use client";
import { trpc } from "@/_trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useCreateProject() {
  const router = useRouter();
  const utils = trpc.useUtils();

  return trpc.project.create.useMutation({
    onSuccess: (data) => {
      // Invalidate feed so new project appears immediately
      utils.project.getFeed.invalidate();
      toast.success("Project published!");
      router.push(`/project/${data.id}`);
    },
    onError: (error) => {
      // error.message is the TRPCError message from your friend's procedure
      toast.error(error.message ?? "Failed to publish. Try again.");
    },
  });
}
```

---

### Day 4 Definition of Done

- [ ] Zero raw `<img>` tags — confirmed by grep
- [ ] Rich text content rendered through `sanitizeHtml` everywhere
- [ ] Image uploads compress to under 1MB before Supabase
- [ ] Error boundaries wrap all data-heavy sections
- [ ] Every mutation has a user-facing success and error toast
- [ ] Lighthouse LCP is Green (under 2.5s) on live URL

---

## Part 6 — Day 5: Polish & Handoff (Thursday, May 7)

**Goal:** Skeleton loaders, full SEO coverage, 404 page, loading.tsx files, Lighthouse green across the board.

---

### 6.1 Skeleton Loaders

Skeletons must match the exact dimensions of the content they replace. A skeleton that's the wrong height causes a layout shift when content loads — defeating the purpose.

```typescript
// src/components/ui/skeleton.tsx (shadcn/ui provides this — verify it exists)
import { cn } from "@/lib/utils";
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
}
```

```typescript
// src/components/project/project-card-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export function ProjectCardSkeleton() {
  return (
    <article className="rounded-xl border bg-card p-4 space-y-3">
      <Skeleton className="aspect-video w-full rounded-lg" />  {/* matches image ratio */}
      <div className="space-y-1.5">
        <Skeleton className="h-5 w-3/4" />                     {/* title line */}
        <Skeleton className="h-4 w-full" />                    {/* description */}
        <Skeleton className="h-4 w-4/6" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />        {/* avatar */}
          <Skeleton className="h-4 w-20" />                    {/* username */}
        </div>
        <Skeleton className="h-4 w-12" />                      {/* like count */}
      </div>
    </article>
  );
}

export function ProjectFeedSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <ProjectCardSkeleton key={i} />
      ))}
    </div>
  );
}
```

---

### 6.2 Loading Files for App Router

Next.js uses `loading.tsx` to show UI during server-side data fetching and navigation. Create one per major route.

```typescript
// src/app/(pages)/feed/loading.tsx
import { ProjectFeedSkeleton } from "@/components/project/project-card-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function FeedLoading() {
  return (
    <div className="container py-8 space-y-6">
      <Skeleton className="h-8 w-32" />
      <ProjectFeedSkeleton />
    </div>
  );
}
```

Create `loading.tsx` for: `/feed`, `/profile/[username]`, `/project/[id]`, `/notifications`

---

### 6.3 SEO Metadata — Full Coverage

**Static metadata for the root layout:**

```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: { default: "Talas — Portfolio for Creators", template: "%s | Talas" },
  description:
    "Showcase your work, document your process, collaborate with other creators.",
  metadataBase: new URL("https://talas-app.vercel.app"),
  openGraph: {
    type: "website",
    siteName: "Talas",
    images: [
      {
        url: "/og-image.png", // 1200x630px — design this in Figma, make it look good
        width: 1200,
        height: 630,
        alt: "Talas — Portfolio for Creators",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};
```

**Dynamic metadata for project pages:**

```typescript
// src/app/(pages)/project/[id]/metadata.ts
import type { Metadata } from "next";

// Called by Next.js before rendering — runs on server, can fetch data
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  // Use the same server-side helpers from the prefetch setup
  const project = await fetchProjectForMetadata(params.id).catch(() => null);
  if (!project) return { title: "Project Not Found" };

  const description = project.description
    ? project.description.replace(/<[^>]+>/g, "").slice(0, 155) // strip HTML tags
    : `A project by ${project.owner.name} on Talas.`;

  return {
    title: project.title,
    description,
    openGraph: {
      title: project.title,
      description,
      type: "article",
      authors: [project.owner.name],
      images: project.thumbnailUrl
        ? [{ url: project.thumbnailUrl, width: 1200, height: 630 }]
        : [],
    },
    twitter: { card: "summary_large_image", title: project.title, description },
  };
}
```

**Dynamic metadata for profile pages:**

```typescript
// src/app/(pages)/profile/[username]/metadata.ts
export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const user = await fetchUserByUsername(params.username).catch(() => null);
  if (!user) return { title: "User Not Found" };

  return {
    title: `${user.name} (@${user.username})`,
    description: user.bio ?? `${user.name}'s portfolio on Talas.`,
    openGraph: {
      title: `${user.name} on Talas`,
      description: user.bio ?? `${user.name}'s portfolio on Talas.`,
      images: user.avatarUrl ? [{ url: user.avatarUrl }] : [],
    },
  };
}
```

Test OG previews at `https://www.opengraph.xyz` — paste your live URL and verify the image/title/description look correct.

---

### 6.4 Not Found and Global Error Pages

```typescript
// src/app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 text-center px-4">
      <p className="text-8xl font-bold tracking-tight text-muted-foreground/30">404</p>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground max-w-md">
          This page doesn't exist or was moved. Check the URL or head back to the feed.
        </p>
      </div>
      <Link href="/feed" className="btn-primary">Back to feed</Link>
    </main>
  );
}
```

```typescript
// src/app/global-error.tsx — catches errors in the root layout itself
"use client";
export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <button onClick={reset} className="btn-primary">Try again</button>
      </body>
    </html>
  );
}
```

---

### 6.5 Final Lighthouse Run

Target scores before calling Day 5 done:

| Metric         | Target | What affects it                             |
| -------------- | ------ | ------------------------------------------- |
| Performance    | 85+    | LCP, image sizes, JS bundle, TTFB           |
| Accessibility  | 95+    | Alt text, color contrast, focus rings, ARIA |
| Best Practices | 95+    | HTTPS, security headers, no console errors  |
| SEO            | 90+    | Meta tags, robots, sitemap                  |

Run on mobile preset — it's a harder target and more representative of real users.

---

### Day 5 Definition of Done

- [ ] Skeleton loaders active on all data-heavy pages
- [ ] OG preview correct on `opengraph.xyz` for project and profile pages
- [ ] `loading.tsx` files for all main routes
- [ ] 404 page is branded
- [ ] `global-error.tsx` exists
- [ ] Lighthouse mobile: Performance 85+, Accessibility 95+, SEO 90+

---

## Part 7 — Forms, State, and Data Patterns (Complete Reference)

These patterns apply across all days. Use them consistently throughout the codebase.

---

### 7.1 React Hook Form + Zod — Complete Form Pattern

```typescript
// src/components/project/create-project-form.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/_trpc/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Schema is the single source of truth for validation
// Ideally this is shared with your friend's tRPC input schema
const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Tell us more — at least 10 characters").max(500),
  githubUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  categoryId: z.string().min(1, "Select a category"),
});

type CreateProjectInput = z.infer<typeof createProjectSchema>;

export function CreateProjectForm() {
  const router = useRouter();
  const utils = trpc.useUtils();

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      description: "",
      githubUrl: "",
      categoryId: "",
    },
  });

  const createProject = trpc.project.create.useMutation({
    onSuccess: (data) => {
      utils.project.getFeed.invalidate();
      toast.success("Project published!");
      router.push(`/project/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message ?? "Failed to publish. Try again.");
    },
  });

  function onSubmit(values: CreateProjectInput) {
    createProject.mutate(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project title</FormLabel>
              <FormControl>
                <Input placeholder="My awesome project" {...field} />
              </FormControl>
              <FormMessage /> {/* automatically shows Zod error */}
            </FormItem>
          )}
        />

        {/* Repeat pattern for other fields */}

        <Button
          type="submit"
          disabled={createProject.isPending}  // isPending in v5, not isLoading
          className="w-full"
        >
          {createProject.isPending ? "Publishing..." : "Publish project"}
        </Button>
      </form>
    </Form>
  );
}
```

---

### 7.2 Zustand Store — Global UI State

Zustand is for client-only state that does not belong in the server (filters, sidebar state, temporary UI flags). Do not put server data here — that is TanStack Query's job.

```typescript
// src/store/ui-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware"; // adds Redux DevTools support

type FeedFilter = "all" | "following" | "trending";

interface UIState {
  // Feed
  activeFeedFilter: FeedFilter;
  setActiveFeedFilter: (filter: FeedFilter) => void;

  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Collaboration invite modal
  inviteModalProjectId: string | null;
  openInviteModal: (projectId: string) => void;
  closeInviteModal: () => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      activeFeedFilter: "all",
      setActiveFeedFilter: (filter) => set({ activeFeedFilter: filter }),

      isSidebarOpen: false,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      inviteModalProjectId: null,
      openInviteModal: (projectId) => set({ inviteModalProjectId: projectId }),
      closeInviteModal: () => set({ inviteModalProjectId: null }),
    }),
    { name: "talas-ui-store" },
  ),
);
```

Usage:

```typescript
// Reading state — subscribe only to what you need (prevents unnecessary re-renders)
const activeFeedFilter = useUIStore((state) => state.activeFeedFilter);
const setActiveFeedFilter = useUIStore((state) => state.setActiveFeedFilter);

// WRONG — subscribes to entire store, re-renders on any state change
const store = useUIStore();
```

---

### 7.3 Optimistic Updates — Social Interactions

Optimistic updates make social interactions feel instant. The pattern: update the cache immediately, roll back if the server fails.

```typescript
// src/components/project/like-button.tsx
"use client";
import { trpc } from "@/_trpc/client";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function LikeButton({ projectId }: { projectId: string }) {
  const utils = trpc.useUtils();

  // Read from the cache that was either prefetched or previously fetched
  const { data: project } = trpc.project.getById.useQuery({ id: projectId });

  const toggleLike = trpc.project.toggleLike.useMutation({
    onMutate: async ({ projectId }) => {
      // 1. Cancel any in-flight refetches to prevent race conditions
      await utils.project.getById.cancel({ id: projectId });

      // 2. Snapshot current cache value for rollback
      const previous = utils.project.getById.getData({ id: projectId });

      // 3. Optimistically update the cache — UI changes instantly
      utils.project.getById.setData({ id: projectId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          likeCount: old.isLikedByCurrentUser ? old.likeCount - 1 : old.likeCount + 1,
          isLikedByCurrentUser: !old.isLikedByCurrentUser,
        };
      });

      return { previous };
    },
    onError: (_err, { projectId }, context) => {
      // 4. Rollback to snapshot on failure
      if (context?.previous) {
        utils.project.getById.setData({ id: projectId }, context.previous);
      }
      toast.error("Could not update like. Try again.");
    },
    onSettled: ({ projectId }) => {
      // 5. Always sync with server truth after mutation settles
      utils.project.getById.invalidate({ id: projectId });
    },
  });

  const isLiked = project?.isLikedByCurrentUser ?? false;
  const count = project?.likeCount ?? 0;

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={() => toggleLike.mutate({ projectId })}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <Heart className={cn("h-4 w-4 transition-colors", isLiked && "fill-red-500 text-red-500")} />
      <span>{count}</span>
    </motion.button>
  );
}
```

Apply the same pattern to bookmark and follow actions.

---

### 7.4 Debounced Search

Firing a tRPC query on every keystroke will hammer your backend. Debounce it.

```typescript
// src/hooks/use-debounced-value.ts
import { useState, useEffect } from "react";

export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

```typescript
// src/components/project/search-bar.tsx
"use client";
import { useState } from "react";
import { trpc } from "@/_trpc/client";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { STALE } from "@/lib/query-config";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300); // wait 300ms after last keystroke

  const { data: results, isPending } = trpc.project.search.useQuery(
    { query: debouncedQuery },
    {
      enabled: debouncedQuery.length > 1, // don't query on empty or single char
      staleTime: STALE.SHORT,
    }
  );

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search projects..."
        className="input w-full"
      />
      {isPending && debouncedQuery.length > 1 && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Spinner className="h-4 w-4" />
        </div>
      )}
      {results && <SearchResults results={results} />}
    </div>
  );
}
```

---

### 7.5 Infinite Scroll on the Feed

```typescript
// src/components/project/infinite-project-feed.tsx
"use client";
import { trpc } from "@/_trpc/client";
import { useEffect, useRef } from "react";
import { STALE } from "@/lib/query-config";

export function InfiniteProjectFeed() {
  const bottomRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isError,
  } = trpc.project.getFeedInfinite.useInfiniteQuery(
    { limit: 12 },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: STALE.MEDIUM,
    }
  );

  // Trigger next page when bottom sentinel enters viewport
  useEffect(() => {
    if (!bottomRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) return <ProjectFeedSkeleton />;
  if (isError) return <QueryError />;

  const projects = data.pages.flatMap((page) => page.items);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {/* Sentinel — invisible div that triggers next page fetch when visible */}
      <div ref={bottomRef} className="h-1" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <Spinner className="h-6 w-6" />
        </div>
      )}

      {!hasNextPage && projects.length > 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          You've seen everything. Time to create something.
        </p>
      )}
    </div>
  );
}
```

---

### 7.6 Real-Time Notifications via Supabase Realtime

Your schema has a `Notification` table. Wire Supabase Realtime to update the notification badge without polling.

```typescript
// src/components/layout/notification-listener.tsx
"use client";
import { createClient } from "@/lib/supabase";
import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { trpc } from "@/_trpc/client";
import { toast } from "sonner";

// Mount this once in your authenticated layout — it has no UI
export function NotificationListener() {
  const { userId } = useAuth();
  const utils = trpc.useUtils();

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`) // per-user channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notification",
          filter: `recipient_id=eq.${userId}`,
        },
        (payload) => {
          // Refresh unread count — badge updates automatically
          utils.notification.getUnreadCount.invalidate();

          // Show a toast for the incoming notification
          const message = payload.new as { type: string; sender_name: string };
          const notifMessage = formatNotificationMessage(message);
          if (notifMessage) toast.info(notifMessage);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, utils]);

  return null;
}

function formatNotificationMessage(notif: {
  type: string;
  sender_name: string;
}): string {
  const map: Record<string, string> = {
    LIKE: `${notif.sender_name} liked your project`,
    FOLLOW: `${notif.sender_name} followed you`,
    COMMENT: `${notif.sender_name} commented on your project`,
    COLLAB_INVITE: `${notif.sender_name} invited you to collaborate`,
  };
  return map[notif.type] ?? "";
}
```

---

## Part 8 — Testing (The Differentiator)

Most junior devs skip this. A tested frontend tells recruiters you build things meant to be maintained.

---

### 8.1 Setup

```bash
npm install --save-dev vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
npm install --save-dev msw msw-trpc  # mock tRPC in tests
```

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

```typescript
// src/test/setup.ts
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => cleanup());
```

---

### 8.2 Component Tests with RTL

Test behavior, not implementation. Ask: "what does the user see and do?"

```typescript
// src/components/project/__tests__/like-button.test.tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { LikeButton } from "../like-button";

// Mock tRPC to avoid real network calls in unit tests
vi.mock("@/_trpc/client", () => ({
  trpc: {
    project: {
      getById: {
        useQuery: () => ({
          data: { likeCount: 10, isLikedByCurrentUser: false },
        }),
      },
      toggleLike: {
        useMutation: ({ onMutate }: any) => ({
          mutate: (vars: any) => onMutate?.(vars),
          isPending: false,
        }),
      },
    },
    useUtils: () => ({
      project: {
        getById: {
          cancel: vi.fn(),
          getData: vi.fn(() => ({ likeCount: 10, isLikedByCurrentUser: false })),
          setData: vi.fn(),
          invalidate: vi.fn(),
        },
      },
    }),
  },
}));

describe("LikeButton", () => {
  it("renders like count", () => {
    render(<LikeButton projectId="test-id" />);
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("updates count optimistically on click", async () => {
    const user = userEvent.setup();
    render(<LikeButton projectId="test-id" />);

    await user.click(screen.getByRole("button"));

    // Optimistic update fires immediately — no async wait needed
    expect(screen.getByText("11")).toBeInTheDocument();
  });
});
```

```typescript
// src/components/project/__tests__/create-project-form.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { CreateProjectForm } from "../create-project-form";

describe("CreateProjectForm", () => {
  it("shows validation error when title is too short", async () => {
    const user = userEvent.setup();
    render(<CreateProjectForm />);

    await user.type(screen.getByLabelText(/project title/i), "Hi"); // only 2 chars
    await user.click(screen.getByRole("button", { name: /publish/i }));

    await waitFor(() => {
      expect(screen.getByText(/at least 3 characters/i)).toBeInTheDocument();
    });
  });

  it("disables submit button while mutation is pending", async () => {
    // mock isPending = true
    render(<CreateProjectForm />);
    // fill valid form, submit, verify button is disabled
  });
});
```

---

### 8.3 Playwright E2E Tests

E2E tests catch what unit tests miss — full user flows, auth, redirects.

```bash
npm install --save-dev @playwright/test
npx playwright install chromium
```

```typescript
// playwright.config.ts
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("redirects unauthenticated users from /feed to /sign-in", async ({
    page,
  }) => {
    await page.goto("/feed");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("redirects to requested page after sign in", async ({ page }) => {
    await page.goto("/feed");
    await expect(page).toHaveURL(/sign-in\?redirect_url=%2Ffeed/);
  });
});

// e2e/project.spec.ts
test.describe("Project pages", () => {
  test("project detail page is publicly accessible", async ({ page }) => {
    // Use a known seeded project ID
    await page.goto("/project/test-project-id");
    await expect(page.getByRole("heading")).toBeVisible();
  });

  test("create project requires authentication", async ({ page }) => {
    await page.goto("/project/new");
    await expect(page).toHaveURL(/sign-in/);
  });
});
```

```bash
# Add to package.json scripts
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui"
```

---

## Part 9 — Post-Launch: What Separates Senior Work

These are not in the 5-day plan but are what make a recruiter pause and look closer.

---

### 9.1 Error Monitoring with Sentry

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Sentry auto-captures unhandled errors in server and client code. After setup, add it to your error boundary's `componentDidCatch`. Now you know when real users hit real errors, not just when you're testing.

---

### 9.2 Bundle Analysis

```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer(nextConfig);
```

```bash
ANALYZE=true npm run build
```

Look for: any library over 50KB that loads on every page. The most common offenders are date libraries (use `date-fns` with tree-shaking, not `moment`), icon libraries (import individual icons, not the whole library), and rich text editors (always dynamic import).

---

### 9.3 Dynamic Import for CKEditor

The project overview explicitly mentions CKEditor. It is large. Never import it statically.

```typescript
// src/components/project/rich-text-editor.tsx
"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const CKEditorComponent = dynamic(
  () => import("./ckeditor-implementation"), // the actual CKEditor wrapper
  {
    ssr: false,                              // CKEditor does not work server-side
    loading: () => <Skeleton className="h-64 w-full rounded-lg" />,
  }
);

export function RichTextEditor(props: RichTextEditorProps) {
  return <CKEditorComponent {...props} />;
}
```

---

### 9.4 Accessibility Baseline

Accessibility failures are both a UX and legal concern. The minimum:

- All images have meaningful `alt` text (not empty string, not "image")
- All interactive elements reachable and operable by keyboard (Tab + Enter/Space)
- Color contrast passes WCAG AA (4.5:1 for text) — check with Chrome Accessibility audit
- Focus rings visible on all interactive elements:
  ```css
  /* globals.css */
  :focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }
  ```
- Form inputs have associated `<label>` elements (React Hook Form's `FormLabel` handles this)

Run `npx axe-core` or Chrome DevTools Accessibility panel after every major feature.

---

## Part 10 — Quick Reference

### Files to Know

| Task                            | File                                               |
| ------------------------------- | -------------------------------------------------- |
| Add a new page                  | `src/app/(pages)/[route]/page.tsx`                 |
| Protect a route at server level | `src/middleware.ts`                                |
| Protect a route at client level | `src/components/layout/auth-guard.tsx`             |
| Call a backend tRPC procedure   | `trpc.[router].[procedure].useQuery/useMutation()` |
| Global UI state                 | `src/store/ui-store.ts`                            |
| Upload files to Supabase        | `src/lib/upload-image.ts`                          |
| Page metadata / SEO             | `generateMetadata()` export in `page.tsx`          |
| Loading skeleton UI             | `src/app/(pages)/[route]/loading.tsx`              |
| Route error UI                  | `src/app/(pages)/[route]/error.tsx`                |
| Sanitize rich text              | `src/lib/sanitize-html.ts`                         |
| Query cache time config         | `src/lib/query-config.ts`                          |

### Communication Protocol with Your Backend Friend

Before writing any component that touches data, align on:

1. **Procedure name** — e.g., `project.create`
2. **Input schema** — the Zod shape you validate against on the client
3. **Return type** — what your component renders
4. **Error messages** — what `TRPCError` messages your `onError` handler will display

A 5-minute sync prevents an hour of debugging a type mismatch.

### Commands

```bash
npm run dev                  # local dev server
npm run build                # production build (run before every deploy)
npx tsc --noEmit             # type check (zero errors required)
npm run lint                 # linting (zero errors required)
npm run test                 # unit tests
npm run test:e2e             # E2E tests
ANALYZE=true npm run build   # bundle analysis
```

---

_Master Guide v2.0 — Talas App Frontend | Corrected & Complete | May 2026_
