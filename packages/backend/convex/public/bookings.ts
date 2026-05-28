import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { getCanUseBookings } from "../lib/subscriptionAccess";

// Helper: time string "HH:mm" → minutes from midnight
function timeToMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

// Helper: minutes from midnight → "HH:mm"
function minToTime(m: number): string {
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

// Get active booking services for an organization/agent
export const getServices = query({
  args: {
    organizationId: v.string(),
    agentId: v.optional(v.id("agents")),
  },
  handler: async (ctx, args) => {
    let services;
    if (args.agentId) {
      services = await ctx.db
        .query("bookingServices")
        .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
        .collect();
      if (services.length === 0) {
        services = await ctx.db
          .query("bookingServices")
          .withIndex("by_organization_id", (q) =>
            q.eq("organizationId", args.organizationId),
          )
          .filter((q) => q.eq(q.field("agentId"), undefined))
          .collect();
      }
    } else {
      services = await ctx.db
        .query("bookingServices")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId),
        )
        .filter((q) => q.eq(q.field("agentId"), undefined))
        .collect();
    }
    return services.filter((s) => s.isActive);
  },
});

// Get available dates for the next N days (up to 30)
export const getAvailableDates = query({
  args: {
    organizationId: v.string(),
    agentId: v.optional(v.id("agents")),
    daysAhead: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const maxDays = Math.min(args.daysAhead ?? 30, 30);

    // Get availability records
    let availabilities;
    if (args.agentId) {
      availabilities = await ctx.db
        .query("bookingAvailability")
        .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
        .collect();
      if (availabilities.length === 0) {
        availabilities = await ctx.db
          .query("bookingAvailability")
          .withIndex("by_organization_id", (q) =>
            q.eq("organizationId", args.organizationId),
          )
          .filter((q) => q.eq(q.field("agentId"), undefined))
          .collect();
      }
    } else {
      availabilities = await ctx.db
        .query("bookingAvailability")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId),
        )
        .filter((q) => q.eq(q.field("agentId"), undefined))
        .collect();
    }

    const activeWeekdays = new Set(
      availabilities.filter((a) => a.isActive).map((a) => a.weekday),
    );

    const today = new Date();
    const dates: string[] = [];

    for (let i = 0; i < maxDays; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (activeWeekdays.has(d.getDay())) {
        const dateStr = d.toISOString().slice(0, 10);
        dates.push(dateStr);
      }
    }

    return dates;
  },
});

// Get available time slots for a specific date and service
export const getAvailableSlots = query({
  args: {
    organizationId: v.string(),
    agentId: v.optional(v.id("agents")),
    dateString: v.string(), // "YYYY-MM-DD"
    serviceId: v.id("bookingServices"),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    if (!service || !service.isActive) return [];

    const duration = service.durationMinutes;
    const date = new Date(args.dateString + "T00:00:00Z");
    const weekday = date.getUTCDay(); // 0=Sunday

    // Get availability for this weekday
    let availability;
    if (args.agentId) {
      availability = await ctx.db
        .query("bookingAvailability")
        .withIndex("by_agent_id", (q) => q.eq("agentId", args.agentId!))
        .filter((q) =>
          q.and(
            q.eq(q.field("weekday"), weekday),
            q.eq(q.field("isActive"), true),
          ),
        )
        .first();
      if (!availability) {
        availability = await ctx.db
          .query("bookingAvailability")
          .withIndex("by_organization_id", (q) =>
            q.eq("organizationId", args.organizationId),
          )
          .filter((q) =>
            q.and(
              q.eq(q.field("agentId"), undefined),
              q.eq(q.field("weekday"), weekday),
              q.eq(q.field("isActive"), true),
            ),
          )
          .first();
      }
    } else {
      availability = await ctx.db
        .query("bookingAvailability")
        .withIndex("by_organization_id", (q) =>
          q.eq("organizationId", args.organizationId),
        )
        .filter((q) =>
          q.and(
            q.eq(q.field("agentId"), undefined),
            q.eq(q.field("weekday"), weekday),
            q.eq(q.field("isActive"), true),
          ),
        )
        .first();
    }

    if (!availability) return [];

    // Generate slots every 30 minutes
    const SLOT_INTERVAL = 30;
    const slots: Array<{ time: string; available: boolean }> = [];

    // Get all bookings for this org+date
    const existingBookings = await ctx.db
      .query("bookings")
      .withIndex("by_org_and_date", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("dateString", args.dateString),
      )
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "confirmed"),
        ),
      )
      .collect();

    const start = availability.startMinutes;
    const end = availability.endMinutes;

    for (let slotStart = start; slotStart + duration <= end; slotStart += SLOT_INTERVAL) {
      const slotEnd = slotStart + duration;
      const timeStr = minToTime(slotStart);

      // Check conflict: any booking overlaps [slotStart, slotEnd)
      const hasConflict = existingBookings.some((b) => {
        const bStart = timeToMin(b.timeString);
        const bEnd = bStart + b.serviceDurationMinutes;
        return bStart < slotEnd && bEnd > slotStart;
      });

      slots.push({ time: timeStr, available: !hasConflict });
    }

    return slots;
  },
});

// Create a booking
export const create = mutation({
  args: {
    organizationId: v.string(),
    agentId: v.optional(v.id("agents")),
    contactSessionId: v.id("contactSessions"),
    serviceId: v.id("bookingServices"),
    dateString: v.string(),
    timeString: v.string(),
    notes: v.optional(v.string()),
    gdprConsent: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Validate session
    const session = await ctx.db.get(args.contactSessionId);
    if (!session || session.expiresAt < Date.now()) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Ugyldig sesjon" });
    }
    if (!args.gdprConsent) {
      throw new ConvexError({ code: "BAD_REQUEST", message: "Samtykke er påkrevd" });
    }

    // Verify booking is allowed on current plan
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .unique();
    if (!getCanUseBookings(args.organizationId, subscription)) {
      throw new ConvexError({
        code: "PLAN_RESTRICTED",
        message: "Timebestilling er ikke tilgjengelig på denne planen.",
      });
    }

    // Validate service
    const service = await ctx.db.get(args.serviceId);
    if (!service || !service.isActive) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Tjenesten finnes ikke" });
    }

    // Rate limiting: max 3 bookings per email in last 24h
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentBookings = await ctx.db
      .query("bookings")
      .withIndex("by_organization_id", (q) =>
        q.eq("organizationId", args.organizationId),
      )
      .filter((q) =>
        q.and(
          q.eq(q.field("customerEmail"), session.email),
          q.gt(q.field("createdAt"), oneDayAgo),
        ),
      )
      .collect();

    if (recentBookings.length >= 3) {
      throw new ConvexError({
        code: "TOO_MANY_REQUESTS",
        message: "For mange bestillinger. Vent litt før du prøver igjen.",
      });
    }

    // Check slot is still available
    const slotStart = timeToMin(args.timeString);
    const slotEnd = slotStart + service.durationMinutes;

    const conflicts = await ctx.db
      .query("bookings")
      .withIndex("by_org_and_date", (q) =>
        q
          .eq("organizationId", args.organizationId)
          .eq("dateString", args.dateString),
      )
      .filter((q) =>
        q.or(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("status"), "confirmed"),
        ),
      )
      .collect();

    const hasConflict = conflicts.some((b) => {
      const bStart = timeToMin(b.timeString);
      const bEnd = bStart + b.serviceDurationMinutes;
      return bStart < slotEnd && bEnd > slotStart;
    });

    if (hasConflict) {
      throw new ConvexError({
        code: "CONFLICT",
        message: "Denne timen er ikke lenger ledig. Velg en annen tid.",
      });
    }

    // Generate cancellation token
    const cancellationToken = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

    const now = Date.now();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    // Compute approximate start time (treat date as UTC for ordering)
    const startTime = new Date(
      `${args.dateString}T${args.timeString}:00`,
    ).getTime();

    const bookingId = await ctx.db.insert("bookings", {
      organizationId: args.organizationId,
      agentId: args.agentId,
      contactSessionId: args.contactSessionId,
      customerName: session.name,
      customerEmail: session.email,
      serviceId: args.serviceId,
      serviceName: service.name,
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
      customerEmail: session.email,
      customerName: session.name,
      businessEmail: ws?.bookingNotificationEmail,
      businessName,
      serviceName: service.name,
      durationMinutes: service.durationMinutes,
      dateString: args.dateString,
      timeString: args.timeString,
      cancellationToken,
      notes: args.notes,
    });

    return {
      bookingId,
      cancellationToken,
      customerName: session.name,
      customerEmail: session.email,
      serviceName: service.name,
      dateString: args.dateString,
      timeString: args.timeString,
    };
  },
});

// Cancel a booking via cancellation token (public — no auth needed)
export const cancelByToken = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_cancellation_token", (q) =>
        q.eq("cancellationToken", args.token),
      )
      .first();

    if (!booking) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Bestillingen ble ikke funnet",
      });
    }
    if (booking.status === "cancelled") {
      return { success: true, alreadyCancelled: true };
    }
    if (booking.status === "completed") {
      throw new ConvexError({
        code: "BAD_REQUEST",
        message: "Fullførte bestillinger kan ikke avbestilles",
      });
    }

    await ctx.db.patch(booking._id, { status: "cancelled" });
    return { success: true, alreadyCancelled: false };
  },
});
