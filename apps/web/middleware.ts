import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)",
  "/integrasjoner",
  "/hvordan-det-virker",
  "/personvern",
  "/vilkar",
  "/kontakt",
  "/sitemap.xml",
  "/robots.txt",
  "/api/contact",
  "/api/newsletter",
  "/api/stripe/webhook",
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

  // Innlogget med org: vanlig besøk til / → dashboard. Unntak: eksplisitt lenke fra app (f.eks. sidefelt «Til forsiden»).
  if (userId && orgId && req.nextUrl.pathname === "/") {
    if (req.nextUrl.searchParams.get("from") !== "marketing") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
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
