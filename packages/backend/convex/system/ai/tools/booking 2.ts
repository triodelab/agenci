import { createTool } from "@convex-dev/agent";
import { jsonSchema } from "ai";
import { internal } from "../../../_generated/api";
import { Id } from "../../../_generated/dataModel";

const WEEKDAYS = ["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"];
const MONTHS = ["januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember"];

function formatDateNorwegian(dateString: string): string {
  const d = new Date(dateString + "T12:00:00");
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()}. ${MONTHS[d.getMonth()]}`;
}

type ServiceRow = {
  _id: Id<"bookingServices">;
  name: string;
  durationMinutes: number;
  priceNok?: number;
  isActive: boolean;
};

type SlotRow = { time: string; available: boolean };

type CheckAvailabilityArgs = {
  dateString?: string;
  serviceName?: string;
};

export const checkAvailability = createTool({
  description:
    "Check available booking services and time slots. Call without dateString to get available dates and services. Call with dateString to get available time slots for that day.",
  args: jsonSchema<CheckAvailabilityArgs>({
    type: "object",
    properties: {
      dateString: {
        type: "string",
        description: "Date in YYYY-MM-DD format. Omit to get available dates.",
      },
      serviceName: {
        type: "string",
        description: "Optional service name to filter by",
      },
    },
    additionalProperties: false,
  }),
  handler: async (ctx, args): Promise<string> => {
    if (!ctx.threadId) return "Feil: mangler tråd-ID";

    const conversation: {
      organizationId: string;
      agentId?: Id<"agents">;
    } | null = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId },
    );
    if (!conversation) return "Feil: samtalen ble ikke funnet";

    const orgId: string = conversation.organizationId;
    const agentId: Id<"agents"> | undefined = conversation.agentId;

    const services: ServiceRow[] = await ctx.runQuery(
      internal.system.bookings.getServicesInternal,
      { organizationId: orgId, agentId },
    );

    const activeServices: ServiceRow[] = services.filter((s) => s.isActive);

    if (activeServices.length === 0) {
      return "Ingen tjenester er satt opp for timebestilling ennå.";
    }

    if (!args.dateString) {
      const dates: string[] = await ctx.runQuery(
        internal.system.bookings.getAvailableDatesInternal,
        { organizationId: orgId, agentId },
      );

      const serviceList: string = activeServices
        .map((s) => `• ${s.name} (${s.durationMinutes} min${s.priceNok != null ? `, ${s.priceNok} kr` : ""})`)
        .join("\n");

      const dateList: string = dates
        .slice(0, 7)
        .map((d) => `• ${formatDateNorwegian(d)} (${d})`)
        .join("\n");

      return `Tilgjengelige tjenester:\n${serviceList}\n\nNærmeste ledige datoer:\n${dateList}`;
    }

    const { dateString, serviceName } = args;

    const matchedService: ServiceRow | undefined = serviceName
      ? activeServices.find((s) => s.name.toLowerCase().includes(serviceName.toLowerCase()))
      : activeServices[0];

    if (!matchedService) {
      return `Fant ikke tjenesten "${serviceName}". Tilgjengelige: ${activeServices.map((s) => s.name).join(", ")}`;
    }

    const slots: SlotRow[] = await ctx.runQuery(
      internal.system.bookings.getAvailableSlotsInternal,
      {
        organizationId: orgId,
        agentId,
        dateString,
        serviceId: matchedService._id,
      },
    );

    const available: SlotRow[] = slots.filter((s) => s.available);
    if (available.length === 0) {
      return `Ingen ledige tider for ${matchedService.name} den ${formatDateNorwegian(dateString)}. Prøv en annen dato.`;
    }

    const slotList: string = available.map((s) => s.time).join(", ");
    return `Ledige tider for ${matchedService.name} den ${formatDateNorwegian(dateString)} (${matchedService.durationMinutes} min):\n${slotList}\n\nServiceId: ${matchedService._id}`;
  },
});

type CreateBookingArgs = {
  serviceId: string;
  serviceName: string;
  dateString: string;
  timeString: string;
  notes?: string;
  gdprConsentConfirmed: boolean;
};

export const createBooking = createTool({
  description:
    "Create a booking after the customer has confirmed service, date, time, and given GDPR consent. Only call after explicitly asking the customer to confirm.",
  args: jsonSchema<CreateBookingArgs>({
    type: "object",
    properties: {
      serviceId: { type: "string", description: "Service ID from checkAvailability" },
      serviceName: { type: "string", description: "Human-readable service name" },
      dateString: { type: "string", description: "Date in YYYY-MM-DD format" },
      timeString: { type: "string", description: "Time in HH:mm format" },
      notes: { type: "string", description: "Optional notes from the customer" },
      gdprConsentConfirmed: {
        type: "boolean",
        description: "Must be true — only set after customer explicitly agrees",
      },
    },
    required: ["serviceId", "serviceName", "dateString", "timeString", "gdprConsentConfirmed"],
    additionalProperties: false,
  }),
  handler: async (ctx, args): Promise<string> => {
    if (!args.gdprConsentConfirmed) {
      return "Kan ikke opprette bestilling uten GDPR-samtykke. Be kunden bekrefte at de godtar lagring av navn og e-post.";
    }
    if (!ctx.threadId) return "Feil: mangler tråd-ID";

    const conversation: {
      organizationId: string;
      agentId?: Id<"agents">;
      contactSessionId: Id<"contactSessions">;
    } | null = await ctx.runQuery(
      internal.system.conversations.getByThreadId,
      { threadId: ctx.threadId },
    );
    if (!conversation) return "Feil: samtalen ble ikke funnet";

    const session: {
      name: string;
      email: string;
      expiresAt: number;
    } | null = await ctx.runQuery(
      internal.system.bookings.getContactSessionForConversation,
      { contactSessionId: conversation.contactSessionId },
    );

    if (!session || session.expiresAt < Date.now()) {
      return "Feil: kundeøkten er utløpt. Kunden må starte en ny samtale.";
    }

    if (!session.email || session.email.includes("@widget.local")) {
      return "Kunden er anonym og kan ikke booke time. Be dem logge inn med navn og e-post.";
    }

    // Resolve serviceId — fall back to name lookup if the model passed an invalid ID
    const allServices: ServiceRow[] = await ctx.runQuery(
      internal.system.bookings.getServicesInternal,
      { organizationId: conversation.organizationId, agentId: conversation.agentId },
    );
    const byId: ServiceRow | undefined = allServices.find((s) => s._id === (args.serviceId as Id<"bookingServices">));
    const resolvedService: ServiceRow | undefined = byId ?? allServices.find(
      (s) => s.isActive && s.name.toLowerCase().includes(args.serviceName.toLowerCase()),
    );
    if (!resolvedService) {
      return `Fant ikke tjenesten "${args.serviceName}". Tilgjengelige: ${allServices.filter((s) => s.isActive).map((s) => s.name).join(", ")}`;
    }

    const result: { success: boolean; error?: string } = await ctx.runMutation(
      internal.system.bookings.createBookingInternal,
      {
        organizationId: conversation.organizationId,
        agentId: conversation.agentId,
        contactSessionId: conversation.contactSessionId,
        serviceId: resolvedService._id,
        serviceName: resolvedService.name,
        dateString: args.dateString,
        timeString: args.timeString,
        notes: args.notes,
        customerName: session.name,
        customerEmail: session.email,
      },
    );

    if (!result.success) {
      return result.error ?? "Bestillingen feilet. Prøv igjen.";
    }

    return `Bestilling bekreftet!\n\nTjeneste: ${args.serviceName}\nDato: ${formatDateNorwegian(args.dateString)}\nTid: kl. ${args.timeString}\nKunde: ${session.name} (${session.email})\n\nEn bekreftelse er sendt til ${session.email}.`;
  },
});
