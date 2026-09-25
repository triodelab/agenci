/**
 * Task 1.2 — Server-side session helpers for Next.js route handlers / RSC.
 * Reads the Better Auth session from request headers.
 */
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";

/**
 * Fetch the Better Auth session via the same-origin `/api/auth/get-session`
 * rewrite (cookie forwarded from the incoming request).
 */
export async function getServerSession() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth/get-session`,
    {
      headers: { cookie },
      cache: "no-store",
    },
  );

  if (!res.ok) return null;
  return (await res.json()) as Awaited<
    ReturnType<typeof authClient.getSession>
  >["data"];
}
