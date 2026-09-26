/**
 * Task 1.2 Step 4 — UserSync no-op.
 *
 * Identity lives in Better Auth / Postgres; no user sync is needed.
 * Keep the component mounted so dashboard-layout does not need a larger refactor.
 */
"use client";

export function UserSync() {
  return null;
}
