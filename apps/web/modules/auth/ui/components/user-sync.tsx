/**
 * Task 1.2 Step 4 — UserSync no-op.
 *
 * Previously upserted the Clerk user into Convex (`api.users.add`).
 * Identity now lives in Better Auth / Postgres; Convex user sync is removed.
 * Keep the component mounted so dashboard-layout does not need a larger refactor.
 */
"use client";

export function UserSync() {
  return null;
}
