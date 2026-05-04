// src/proxy.ts
/**
 * Clerk proxy (formerly middleware) for route protection.
 *
 * Next.js 16 renames the `middleware` file convention to `proxy`.
 * See: https://nextjs.org/docs/messages/middleware-to-proxy
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher([
	"/feeds(.*)",
	"/create-project(.*)",
	"/settings(.*)",
	"/notification(.*)",
	"/saved(.*)",
	"/search(.*)",
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
