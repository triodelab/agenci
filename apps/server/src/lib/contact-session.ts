/**
 * Task 4.1 — Widget visitor identity (docs/task.md Phase 4).
 * No Better Auth session; anonymous site visitors are scoped by this
 * unguessable token + org, sent as the `x-contact-session-id` header.
 */
import { createPrismaClient, type Prisma } from "@agenci/db";
import { CONTACT_SESSION_HEADER } from "@/lib/ws-protocol";

const prisma = createPrismaClient();

const CONTACT_SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24h — matches Convex parity target

export class ContactSessionError extends Error {
  constructor(
    message: string,
    readonly code: "MISSING" | "INVALID" | "EXPIRED",
  ) {
    super(message);
    this.name = "ContactSessionError";
  }
}

export async function createContactSession(input: {
  organizationId: string;
  agentId?: string;
  name?: string;
  email?: string;
  anonymous?: boolean;
  metadata?: Record<string, unknown>;
}) {
  return prisma.contactSession.create({
    data: {
      organizationId: input.organizationId,
      agentId: input.agentId,
      name: input.name,
      email: input.email,
      anonymous: input.anonymous ?? true,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      expiresAt: new Date(Date.now() + CONTACT_SESSION_TTL_MS),
    },
  });
}

export async function getContactSessionById(id: string) {
  const session = await prisma.contactSession.findUnique({ where: { id } });
  if (!session) {
    throw new ContactSessionError("Invalid contact session", "INVALID");
  }
  if (session.expiresAt < new Date()) {
    throw new ContactSessionError("Contact session expired", "EXPIRED");
  }
  return session;
}

/** Resolve + validate the contact session from the request headers. */
export async function getContactSessionFromHeaders(headers: Headers) {
  const id = headers.get(CONTACT_SESSION_HEADER);
  if (!id) {
    throw new ContactSessionError("Missing contact session", "MISSING");
  }
  return getContactSessionById(id);
}

export async function updateContactSessionIdentity(input: {
  id: string;
  name: string;
  email: string;
}) {
  return prisma.contactSession.update({
    where: { id: input.id },
    data: { name: input.name, email: input.email, anonymous: false },
  });
}

export async function deleteContactSession(id: string) {
  await prisma.contactSession.delete({ where: { id } });
}
