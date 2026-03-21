import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/produkt",
  "/integrasjoner",
  "/hvordan-det-virker",
]);

const isOrgFreeRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/org-selection(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth();

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (userId && !orgId && !isOrgFreeRoute(req)) {
    const searchParams = new URLSearchParams({ redirectUrl: req.url });

    const orgSelection = new URL(
      `/org-selection?${searchParams.toString()}`,
      req.url,
    );

    return NextResponse.redirect(orgSelection);
  }

  // Logged-in users with an org should use the app shell at /dashboard, not the marketing page at /.
  if (userId && orgId && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
