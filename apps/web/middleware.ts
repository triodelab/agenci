import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/priser",
  "/integrasjoner",
  "/hvordan-det-virker",
  "/personvern",
  "/vilkar",
  "/kontakt",
  "/blogg(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/api/contact",
  "/api/newsletter",
  "/api/stripe/webhook",
  "/api/widget(.*)",
  "/widget(.*)",
  "/booking(.*)",
]);

/** Markedsføring + kontakt — innloggede brukere uten org skal fortsatt kunne besøke */
const isOrgFreeRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/onboarding(.*)",
  "/org-selection(.*)",
  "/integrasjoner",
  "/hvordan-det-virker",
  "/personvern",
  "/vilkar",
  "/kontakt",
]);

export default clerkMiddleware(async (auth, req) => {
  // Public routes: skip auth entirely
  if (isPublicRoute(req)) {
    try {
      const { userId, orgId } = await auth();
      if (userId && orgId && req.nextUrl.pathname === "/") {
        if (req.nextUrl.searchParams.get("from") !== "marketing") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
      }
    } catch {
      // Clerk handshake/clock-skew failures must not take down public pages
    }
    return NextResponse.next();
  }

  await auth.protect();

  const { userId, orgId } = await auth();

  if (userId && !orgId && !isOrgFreeRoute(req)) {
    const searchParams = new URLSearchParams({ redirectUrl: req.url });
    return NextResponse.redirect(
      new URL(`/org-selection?${searchParams.toString()}`, req.url),
    );
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
