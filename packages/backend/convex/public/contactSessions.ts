import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { SESSION_DURATION_MS } from "../constants";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    organizationId: v.string(),
    metadata: v.optional(
      v.object({
        userAgent: v.optional(v.string()),
        language: v.optional(v.string()),
        timezone: v.optional(v.string()),
        timezoneOffset: v.optional(v.number()),
        referrer: v.optional(v.string()),
        currentUrl: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = now + SESSION_DURATION_MS;

    const contactSessionId = await ctx.db.insert("contactSessions", {
      name: args.name,
      email: args.email,
      organizationId: args.organizationId,
      expiresAt,
      metadata: args.metadata,
    });

    return contactSessionId;
  },
});

export const validate = mutation({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const contactSession = await ctx.db.get(args.contactSessionId);

    if (!contactSession) {
      return { valid: false, reason: "Contact session not found" };
    }

    if (contactSession.expiresAt < Date.now()) {
      return { valid: false, reason: "Contact session expired" };
    }

    return { valid: true, contactSession };
  },
});

/** Oppdaterer en anonym sesjon med ekte navn og e-post etter at brukeren har identifisert seg i chatten. */
export const updateIdentity = mutation({
  args: {
    contactSessionId: v.id("contactSessions"),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.contactSessionId);
    if (!session) return { success: false };
    await ctx.db.patch(args.contactSessionId, {
      name: args.name,
      email: args.email,
    });
    return { success: true };
  },
});

/** GDPR art. 17 — visitor-initiated erasure. Anonymises the session immediately. */
export const deleteMySession = mutation({
  args: {
    contactSessionId: v.id("contactSessions"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.contactSessionId);
    if (!session) return { success: false };

    await ctx.db.patch(args.contactSessionId, {
      name: "Slettet",
      email: "slettet@agenci.local",
      metadata: undefined,
      expiresAt: Date.now() - 1,
    });

    return { success: true };
  },
});
