/**
 * Task 1.2 — SSO callback stub.
 * Clerk OAuth redirect target; social login is not configured on Better Auth yet.
 */
import Link from "next/link";

export default function SsoCallbackPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-lg font-semibold">Sosial innlogging</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        OAuth er ikke aktivert på den nye auth-serveren ennå. Bruk e-post og
        passord.
      </p>
      <Link href="/sign-in" className="text-sm font-medium underline">
        Gå til innlogging
      </Link>
    </main>
  );
}
