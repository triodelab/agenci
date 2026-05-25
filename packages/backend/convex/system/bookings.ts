import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function minToTime(m: number): string {
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export const getServicesInternal = internalQuery({
  args: {
    organizationId: v.string(),
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    if (args.agentId) {
      const agentServices = await ctx.db
        .query("bookingServices")
        .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
        .collect();
      if (agentServices.length > 0) return agentServices;
    }
    return ctx.db
      .query("bookingServices")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) => q.eq(q.field("agentId"), undefined))
      .collect();
  },
});

export const getAvailableDatesInternal = internalQuery({
  args: {
    organizationId: v.string(),
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    let availabilities;
    if (args.agentId) {
      availabilities = await ctx.db
        .query("bookingAvailability")
        .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
        .collect();
      if (availabilities.length === 0) {
        availabilities = await ctx.db
          .query("bookingAvailability")
          .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
          .filter((q) => q.eq(q.field("agentId"), undefined))
          .collect();
      }
    } else {
      availabilities = await ctx.db
        .query("bookingAvailability")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
        .filter((q) => q.eq(q.field("agentId"), undefined))
        .collect();
    }

    const activeWeekdays = new Set(
      availabilities.filter((a) => a.isActive).map((a) => a.weekday)
    );

    const today = new Date();
    const dates: string[] = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (activeWeekdays.has(d.getDay())) {
        dates.push(d.toISOString().slice(0, 10));
      }
    }
    return dates;
  },
});

export const getAvailableSlotsInternal = internalQuery({
  args: {
    organizationId: v.string(),
    agentId: v.optional(v.id("agents")),
    dateString: v.string(),
    serviceId: v.id("bookingServices"),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service || !service.isActive) return [];

    const duration = service.durationMinutes;
    const date = new Date(args.dateString + "T00:00:00Z");
    const weekday = date.getUTCDay();

    let avail;
    if (args.agentId) {
      avail = await ctx.db
        .query("bookingAvailability")
        .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
        .filter((q) => q.and(q.eq(q.field("weekday"), weekday), q.eq(q.field("isActive"), true)))
        .first();
    }
    if (!avail) {
      avail = await ctx.db
        .query("bookingAvailability")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
        .filter((q) =>
          q.and(
            q.eq(q.field("agentId"), undefined),
            q.eq(q.field("weekday"), weekday),
            q.eq(q.field("isActive"), true),
          )
        )
        .first();
    }

    if (!avail) return [];

    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_org_and_date", (q) =>
        q.eq("organizationId", args.organizationId).eq("dateString", args.dateString)
      )
      .filter((q) =>
        q.or(q.eq(q.field("status"), "pending"), q.eq(q.field("status"), "confirmed"))
      )
      .collect();

    const slots: Array<{ time: string; available: boolean }> = [];
    for (let slotStart = avail.startMinutes; slotStart + duration <= avail.endMinutes; slotStart += 30) {
      const slotEnd = slotStart + duration;
      const hasConflict = existingBookings.some((b) => {
        const bStart = timeToMin(b.timeString);
        const bEnd = bStart + b.serviceDurationMinutes;
        return bStart < slotEnd && bEnd > slotStart;
      });
      slots.push({ time: minToTime(slotStart), available: !hasConflict });
    }

    return slots;
  },
});

export const getContactSessionForConversation = internalQuery({
  args: { contactSessionId: v.id("contactSessions") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.contactSessionId);
  },
});

export const createBookingInternal = internalMutation({
  args: {
    organizationId: v.string(),
    agentId: v.optional(v.id("agents")),
    contactSessionId: v.id("contactSessions"),
    serviceId: v.id("bookingServices"),
    serviceName: v.string(),
    dateString: v.string(),
    timeString: v.string(),
    notes: v.optional(v.string()),
    customerName: v.string(),
    customerEmail: v.string(),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service || !service.isActive) {
      return { success: false, error: "Tjenesten finnes ikke eller er deaktivert." };
    }

    // Rate limiting: max 3 bookings per email in last 24h
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recent = await ctx.db
      .query("bookings")
      .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
      .filter((q) =>
        q.and(
          q.eq(q.field("customerEmail"), args.customerEmail),
          q.gt(q.field("createdAt"), oneDayAgo),
        )
      )
      .collect();

    if (recent.length >= 3) {
      return { success: false, error: "For mange bestillinger fra denne e-posten i dag." };
    }

    // Check slot conflict
    const slotStart = timeToMin(args.timeString);
    const slotEnd = slotStart + service.durationMinutes;

    const conflicts = await ctx.db
      .query("bookings")
      .withIndex("by_org_and_date", (q) =>
        q.eq("organizationId", args.organizationId).eq("dateString", args.dateString)
      )
      .filter((q) =>
        q.or(q.eq(q.field("status"), "pending"), q.eq(q.field("status"), "confirmed"))
      )
      .collect();

    const hasConflict = conflicts.some((b) => {
      const bStart = timeToMin(b.timeString);
      const bEnd = bStart + b.serviceDurationMinutes;
      return bStart < slotEnd && bEnd > slotStart;
    });

    if (hasConflict) {
      return {
        success: false,
        error: "Denne timen er ikke lenger ledig. Velg en annen tid.",
      };
    }

    const cancellationToken = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const now = Date.now();
    const startTime = new Date(`${args.dateString}T${args.timeString}:00`).getTime();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("bookings", {
      organizationId: args.organizationId,
      agentId: args.agentId,
      contactSessionId: args.contactSessionId,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      serviceId: args.serviceId,
      serviceName: args.serviceName,
      serviceDurationMinutes: service.durationMinutes,
      dateString: args.dateString,
      timeString: args.timeString,
      startTime,
      status: "pending",
      notes: args.notes,
      cancellationToken,
      gdprConsentGiven: true,
      gdprConsentAt: now,
      deleteAfter: startTime + THIRTY_DAYS_MS,
      createdAt: now,
    });

    // Schedule confirmation emails
    let ws = args.agentId
      ? await ctx.db
          .query("widgetSettings")
          .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
          .first()
      : null;
    if (!ws) {
      ws = await ctx.db
        .query("widgetSettings")
        .withIndex("by_organization_id", (q) => q.eq("organizationId", args.organizationId))
        .filter((q) => q.eq(q.field("agentId"), undefined))
        .first();
    }

    let businessName = "Agenci";
    if (args.agentId) {
      const agent = await ctx.db.get(args.agentId);
      if (agent) businessName = agent.name;
    }
    await ctx.scheduler.runAfter(0, internal.system.bookingEmail.sendBookingEmails, {
      customerEmail: args.customerEmail,
      customerName: args.customerName,
      businessEmail: ws?.bookingNotificationEmail,
      businessName,
      serviceName: args.serviceName,
      dateString: args.dateString,
      timeString: args.timeString,
      cancellationToken,
      notes: args.notes,
    });

    return { success: true, cancellationToken };
  },
});
