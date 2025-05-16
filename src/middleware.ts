import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your middleware
export default clerkMiddleware({
  // Add routes that can be accessed without authentication
  publicRoutes: [
    "/",
    "/about",
    "/api/webhook/clerk",
    "/api/webhook/stripe",
    "/api/trpc/(.*)",
    // DEVELOPMENT ONLY - Remove this in production
    "/saved",
  ],
  ignoredRoutes: [
    "/api/webhook/clerk",
    "/api/webhook/stripe",
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};