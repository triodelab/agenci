/**
 * Task 1.2 Step 3 — Middleware using Better Auth session cookie / get-session.
 *
 * Session is read via same-origin `/api/auth/get-session`
 * (Next rewrite → Hono) so cookies stay first-party.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PATHS = [
  "/",
  "/priser",
  "/produktet",
  "/personvern",
  "/vilkar",
  "/kontakt",
  "/blogg",
  "/sitemap.xml",
  "/robots.txt",
  "/api/contact",
  "/api/newsletter",
  "/api/stripe/webhook",
  "/api/widget",
  "/api/auth",
  "/widget",
  "/booking",
];

/** Innloggede uten org kan fortsatt besøke disse */
const ORG_FREE_PREFIXES = [
  "/onboarding",
  "/produktet",
  "/personvern",
  "/vilkar",
  "/kontakt",
];

/** The staff dashboard is its own app (apps/dashboard). */
const DASHBOARD_URL = (
  process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3004"
).replace(/\/$/, "");

/**
 * The old Next dashboard + onboarding here were built on Convex, which is
 * gone. Their URLs now forward to the new dashboard instead of crashing.
 */
const LEGACY_APP_PREFIXES = [
  "/dashboard",
  "/agents",
  "/conversations",
  "/customization",
  "/files",
  "/integrations",
  "/plugins",
  "/settings",
  "/billing",
  "/onboarding",
];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow Better Auth + Next internals handled by matcher exclusion
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  if (matchesPrefix(pathname, LEGACY_APP_PREFIXES)) {
    return NextResponse.redirect(`${DASHBOARD_URL}/`);
  }

  // Login and sign-up live in the dashboard; old links and bookmarks go there.
  if (matchesPrefix(pathname, ["/sign-in"])) {
    return NextResponse.redirect(`${DASHBOARD_URL}/login?mode=signin`);
  }
  if (matchesPrefix(pathname, ["/sign-up"])) {
    return NextResponse.redirect(`${DASHBOARD_URL}/login`);
  }

  const isPublic = matchesPrefix(pathname, PUBLIC_PATHS);
  const sessionCookie = getSessionCookie(req);

  // The website is always reachable, signed in or not; the nav links to the
  // dashboard (no automatic bounce from "/" any more).
  if (isPublic) {
    return NextResponse.next();
  }

  // Protected routes
  if (!sessionCookie) {
    return NextResponse.redirect(`${DASHBOARD_URL}/login?mode=signin`);
  }

  const session = await fetchSession(req);
  if (!session?.user) {
    return NextResponse.redirect(`${DASHBOARD_URL}/login?mode=signin`);
  }

  const orgId = session.session?.activeOrganizationId ?? null;
  if (!orgId && !matchesPrefix(pathname, ORG_FREE_PREFIXES)) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  return NextResponse.next();
}

async function fetchSession(req: NextRequest) {
  const res = await fetch(new URL("/api/auth/get-session", req.nextUrl.origin), {
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as {
    user?: { id: string };
    session?: { activeOrganizationId?: string | null };
  } | null;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|webm|mov|mp3|wav|avif|pdf|txt)).*)",
    "/(api|trpc)(.*)",
  ],
};
