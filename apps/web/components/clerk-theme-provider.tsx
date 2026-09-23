/**
 * Task 1.2 — Deprecated.
 * ClerkThemeProvider removed from the tree (see `components/providers.tsx`).
 * Kept as a no-op export so old imports do not break during the migration.
 */
"use client";

import * as React from "react";

/** @deprecated Use Better Auth via `@/lib/auth-client` instead of Clerk. */
export function ClerkThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
