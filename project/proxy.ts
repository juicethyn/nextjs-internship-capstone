import { clerkMiddleware } from "@clerk/nextjs/server";

// Add more protected route prefixes as needed
const protectedPrefixes = ["/sync", "/w", "/onboarding", "/account"];

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
