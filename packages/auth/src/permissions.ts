/**
 * Task 1.1 — Agenci organization access control (Better Auth).
 *
 * Replaces the demo `project:*` statements with:
 * 1. Better Auth organization defaults (org / member / invitation / team / ac)
 * 2. Product permissions for dashboard features (agents, KB, conversations, etc.)
 *
 * Roles are wired into `organization({ ac, roles })` in `./index.ts` and mirrored
 * on the web client via `organizationClient({ ac, roles })`.
 */
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/organization/access";

/**
 * Product resources used by private Hono routers (Phase 5+) and hasPermission checks.
 * Keep action names stable — clients and server share this module.
 */
const agenciStatements = {
  ...defaultStatements,
  agent: ["create", "read", "update", "delete"],
  knowledgeBase: ["create", "read", "update", "delete"],
  conversation: ["read", "update", "delete"],
  booking: ["create", "read", "update", "delete"],
  billing: ["read", "manage"],
  settings: ["read", "update"],
} as const;

export const ac = createAccessControl(agenciStatements);

/** Member — read-heavy; can participate in chat/bookings but not billing or invites. */
export const member = ac.newRole({
  organization: [],
  member: [],
  invitation: [],
  team: [],
  ac: ["read"],
  agent: ["read"],
  knowledgeBase: ["read"],
  conversation: ["read", "update"],
  booking: ["create", "read"],
  billing: ["read"],
  settings: ["read"],
});

/** Admin — full product control except deleting the organization / ownership. */
export const admin = ac.newRole({
  organization: ["update"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
  agent: ["create", "read", "update", "delete"],
  knowledgeBase: ["create", "read", "update", "delete"],
  conversation: ["read", "update", "delete"],
  booking: ["create", "read", "update", "delete"],
  billing: ["read", "manage"],
  settings: ["read", "update"],
});

/** Owner — same as admin plus organization delete. */
export const owner = ac.newRole({
  organization: ["update", "delete"],
  member: ["create", "update", "delete"],
  invitation: ["create", "cancel"],
  team: ["create", "update", "delete"],
  ac: ["create", "read", "update", "delete"],
  agent: ["create", "read", "update", "delete"],
  knowledgeBase: ["create", "read", "update", "delete"],
  conversation: ["read", "update", "delete"],
  booking: ["create", "read", "update", "delete"],
  billing: ["read", "manage"],
  settings: ["read", "update"],
});
