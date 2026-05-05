// src/proxy.ts
/**
 * Clerk proxy (formerly middleware) for route protection.
 *
 * Next.js 16 renames the `middleware` file convention to `proxy`.
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 *
 * Guest-friendly access policy:
 * - PUBLIC (no auth required):  /, /feeds, /project/[id], /search, /about, /sign-in, /sign-up
 * - PROTECTED (auth required):  /saved, /notifications, /settings, /create-project,
 *                               /profile/[username]/edit, /project/[id]/edit
 *
 * NOTE: /notification (singular) is also protected as it's an account-specific page.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Only routes that must be strictly authenticated.
// Feeds, search, and project detail pages are intentionally public
// so guests (e.g., recruiters) can browse without friction.
const isProtectedRoute = createRouteMatcher([
  "/saved(.*)",
  "/notifications(.*)",
  "/notification(.*)",
  "/settings(.*)",
  "/create-project(.*)",
  "/profile/(.*)/edit(.*)",
  "/project/(.*)/edit(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect({
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
