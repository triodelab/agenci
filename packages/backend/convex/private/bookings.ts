import { ConvexError, v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import { getOrgIdOrNull } from "../lib/auth";
import { paginationOptsValidator } from "convex/server";

function requireOrg(orgId: string | null): string {
  if (!orgId) throw new ConvexError("No organization in session.");
  return orgId;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const list = query({
  args: {
    agentId: v.optional(v.id("agents")),
    status: v.optional(v.string()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return { page: [], isDone: true, continueCursor: "" };

    const results = await ctx.db
      .query("bookings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .order("desc")
      .paginate(args.paginationOpts);

    let filtered = results.page;
    if (args.agentId) filtered = filtered.filter((b) => b.agentId === args.agentId);
    if (args.status) filtered = filtered.filter((b) => b.status === args.status);

    return { ...results, page: filtered };
  },
});

export const getStats = query({
  args: { agentId: v.optional(v.id("agents")) },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) {
      return { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 };
    }

    const all = await ctx.db
      .query("bookings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .collect();

    const filtered = args.agentId
      ? all.filter((b) => b.agentId === args.agentId)
      : all;

    return {
      total: filtered.length,
      pending: filtered.filter((b) => b.status === "pending").length,
      confirmed: filtered.filter((b) => b.status === "confirmed").length,
      completed: filtered.filter((b) => b.status === "completed").length,
      cancelled: filtered.filter((b) => b.status === "cancelled").length,
    };
  },
});

export const updateStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("cancelled"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, args) => {
    const orgId = requireOrg(await getOrgIdOrNull(ctx));
    const booking = await ctx.db.get(args.bookingId);
    if (!booking || booking.organizationId !== orgId) {
      throw new ConvexError("Bestillingen ble ikke funnet.");
    }
    await ctx.db.patch(args.bookingId, { status: args.status });
  },
});

// ─── Services ────────────────────────────────────────────────────────────────

export const listServices = query({
  args: { agentId: v.optional(v.id("agents")) },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return [];

    if (args.agentId) {
      const agentServices = await ctx.db
        .query("bookingServices")
        .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
        .collect();
      if (agentServices.length > 0) return agentServices;
    }

    return ctx.db
      .query("bookingServices")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .filter((q) => q.eq(q.field("agentId"), undefined))
      .collect();
  },
});

export const createService = mutation({
  args: {
    agentId: v.optional(v.id("agents")),
    name: v.string(),
    durationMinutes: v.number(),
    priceNok: v.optional(v.number()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = requireOrg(await getOrgIdOrNull(ctx));
    return ctx.db.insert("bookingServices", {
      organizationId: orgId,
      agentId: args.agentId,
      name: args.name,
      durationMinutes: args.durationMinutes,
      priceNok: args.priceNok,
      description: args.description,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const updateService = mutation({
  args: {
    serviceId: v.id("bookingServices"),
    name: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    priceNok: v.optional(v.number()),
    description: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const orgId = requireOrg(await getOrgIdOrNull(ctx));
    const service = await ctx.db.get(args.serviceId);
    if (!service || service.organizationId !== orgId) {
      throw new ConvexError("Tjenesten ble ikke funnet.");
    }
    const { serviceId: _serviceId, ...rest } = args;
    const patch = Object.fromEntries(
      Object.entries(rest).filter(([, val]) => val !== undefined),
    );
    await ctx.db.patch(args.serviceId, patch);
  },
});

export const deleteService = mutation({
  args: { serviceId: v.id("bookingServices") },
  handler: async (ctx, args) => {
    const orgId = requireOrg(await getOrgIdOrNull(ctx));
    const service = await ctx.db.get(args.serviceId);
    if (!service || service.organizationId !== orgId) {
      throw new ConvexError("Tjenesten ble ikke funnet.");
    }
    await ctx.db.delete(args.serviceId);
  },
});

// ─── Availability ─────────────────────────────────────────────────────────────

export const getAvailability = query({
  args: { agentId: v.optional(v.id("agents")) },
  handler: async (ctx, args) => {
    const orgId = await getOrgIdOrNull(ctx);
    if (!orgId) return [];

    if (args.agentId) {
      const agentAvail = await ctx.db
        .query("bookingAvailability")
        .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
        .collect();
      if (agentAvail.length > 0) return agentAvail;
    }

    return ctx.db
      .query("bookingAvailability")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", orgId))
      .filter((q) => q.eq(q.field("agentId"), undefined))
      .collect();
  },
});

export const setAvailabilityDay = mutation({
  args: {
    agentId: v.optional(v.id("agents")),
    weekday: v.number(),
    startMinutes: v.number(),
    endMinutes: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const orgId = requireOrg(await getOrgIdOrNull(ctx));

    const existing = args.agentId
      ? await ctx.db
          .query("bookingAvailability")
          .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
          .filter((q) => q.eq(q.field("weekday"), args.weekday))
          .first()
      : await ctx.db
          .query("bookingAvailability")
          .withIndex("by_organization_id", (q) =>
            q.eq("organizationId", orgId),
          )
          .filter((q) =>
            q.and(
              q.eq(q.field("agentId"), undefined),
              q.eq(q.field("weekday"), args.weekday),
            ),
          )
          .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        startMinutes: args.startMinutes,
        endMinutes: args.endMinutes,
        isActive: args.isActive,
      });
    } else {
      await ctx.db.insert("bookingAvailability", {
        organizationId: orgId,
        agentId: args.agentId,
        weekday: args.weekday,
        startMinutes: args.startMinutes,
        endMinutes: args.endMinutes,
        isActive: args.isActive,
      });
    }
  },
});

// ─── Booking settings (on widgetSettings) ─────────────────────────────────────

export const updateBookingSettings = mutation({
  args: {
    agentId: v.optional(v.id("agents")),
    bookingEnabled: v.boolean(),
    bookingNotificationEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const orgId = requireOrg(await getOrgIdOrNull(ctx));

    const existing = args.agentId
      ? await ctx.db
          .query("widgetSettings")
          .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
          .first()
      : await ctx.db
          .query("widgetSettings")
          .withIndex("by_organization_id", (q) =>
            q.eq("organizationId", orgId),
          )
          .filter((q) => q.eq(q.field("agentId"), undefined))
          .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        bookingEnabled: args.bookingEnabled,
        bookingNotificationEmail: args.bookingNotificationEmail,
      });
    } else {
      await ctx.db.insert("widgetSettings", {
        organizationId: orgId,
        agentId: args.agentId,
        greetMessage: "Hei! Hvordan kan jeg hjelpe deg i dag?",
        defaultSuggestions: {},
        vapiSettings: {},
        bookingEnabled: args.bookingEnabled,
        bookingNotificationEmail: args.bookingNotificationEmail,
      });
    }
  },
});

// ─── GDPR auto-delete (called by cron) ───────────────────────────────────────

export const purgeExpiredBookings = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expired = await ctx.db
      .query("bookings")
      .withIndex("by_delete_after", (q) => q.lt("deleteAfter", now))
      .take(100);

    for (const booking of expired) {
      await ctx.db.patch(booking._id, {
        customerName: "Slettet",
        customerEmail: "slettet@agenci.local",
        notes: undefined,
      });
    }

    return { purged: expired.length };
  },
});
