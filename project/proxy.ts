// TODO: Task 2.2 - Configure authentication middleware for route protection
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// NOTE: Next.js 16+ - The "middleware" file convention is deprecated.
// When implementing authentication, consider using the new "proxy" pattern.
// Learn more: https://nextjs.org/docs/messages/middleware-to-proxy

// Placeholder middleware - currently allows all routes for development
// TODO: Replace with actual Clerk authMiddleware when authentication is implemented

// export default function middleware() {
// 	// TODO: Implement actual authentication middleware
// 	// For now, allow all routes so interns can navigate and see the mock pages
// 	console.log("TODO: Implement Clerk authentication middleware");

// 	// Return undefined to allow all requests through
// 	return undefined;
// }

// Add more protected route prefixes as needed
const protectedPrefixes = [
	"/dashboard",
	"/projects",
	"/team",
	"/analytics",
	"/calendar",
	"/settings",
];

export default clerkMiddleware(async (auth, req) => {
	const pathname = req.nextUrl.pathname;

	const isProtectedRoute = protectedPrefixes.some(
		(prefixes) => pathname === prefixes || pathname.startsWith(`${prefixes}/`),
	);

	if (isProtectedRoute) {
		await auth.protect();
	}
});

export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
		// Always run for Clerk-specific frontend API routes
		"/__clerk/(.*)",
	],
};

/*
TODO: Task 2.2 Implementation Notes for Interns:
- Install and configure Clerk
- Set up authMiddleware to protect routes
- Configure public routes: ["/", "/sign-in", "/sign-up"]
- Protect all dashboard routes: ["/dashboard", "/projects"]
- Add proper redirects for unauthenticated users

Example implementation when ready:
export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],
  ignoredRoutes: [],
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}
*/
