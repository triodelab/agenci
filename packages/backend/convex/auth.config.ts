/**
 * Legacy Convex backend — no identity provider is configured, so
 * `ctx.auth.getUserIdentity()` returns null. Auth lives in Better Auth
 * (`@agenci/auth`) on apps/server; this package is kept only until the
 * remaining dashboard features are ported (see docs/task.md Phase 9).
 */
export default {
  providers: [],
};
