// src/middleware.ts
/**
 * Clerk middleware for route protection.
 * Runs on the Edge before any page renders.
 *
 * Protected routes require authentication (user must be logged in).
 * Public routes are accessible to anyone (logged in or not).
 *
 * This ensures recruiters can view public profiles/projects without login,
 * but users must authenticate to create content or access their feed.
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/feeds(.*)", // feed requires auth
  "/create-project(.*)", // creating projects requires auth
  "/settings(.*)", // profile settings require auth
  "/notification(.*)", // notifications require auth
  "/saved(.*)", // saved/bookmarked projects require auth
  "/search(.*)", // search is within the authenticated feed
]);

export default clerkMiddleware(async (auth, req) => {
  // If it's a protected route, require authentication
  if (isProtectedRoute(req)) {
    await auth.protect({
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
