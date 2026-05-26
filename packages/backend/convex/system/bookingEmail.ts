import { v } from "convex/values";
import { internalAction } from "../_generated/server";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
}

function formatDateLong(dateString: string): string {
  const WEEKDAYS = ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"];
  const MONTHS = [
    "januar", "februar", "mars", "april", "mai", "juni",
    "juli", "august", "september", "oktober", "november", "desember",
  ];
  const d = new Date(dateString + "T12:00:00");
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()}. ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function addMinutes(timeString: string, minutes: number): string {
  const [h, m] = timeString.split(":").map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function toICSDate(dateString: string, timeString: string): string {
  return dateString.replace(/-/g, "") + "T" + timeString.replace(":", "") + "00";
}

function generateICS(params: {
  uid: string;
  dtStart: string;
  dtEnd: string;
  summary: string;
  description: string;
  location?: string;
}): string {
  const now = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Agenci//Booking//NO",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${params.uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${params.dtStart}`,
    `DTEND:${params.dtEnd}`,
    `SUMMARY:${params.summary}`,
    `DESCRIPTION:${params.description.replace(/\n/g, "\\n")}`,
    ...(params.location ? [`LOCATION:${params.location}`] : []),
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}

function googleCalendarUrl(params: {
  title: string;
  dtStart: string;
  dtEnd: string;
  details: string;
}): string {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: params.title,
    dates: `${params.dtStart}/${params.dtEnd}`,
    details: params.details,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

// ── Email sender ──────────────────────────────────────────────────────────────

async function sendEmail(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: string }>;
}): Promise<void> {
  const body: Record<string, unknown> = {
    from: params.from,
    to: [params.to],
    subject: params.subject,
    html: params.html,
  };
  if (params.attachments && params.attachments.length > 0) {
    body.attachments = params.attachments;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend ${res.status}: ${text}`);
  }
}

// ── HTML templates ────────────────────────────────────────────────────────────

const BASE_STYLES = `font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#18181b`;

function detailsTable(rows: Array<{ label: string; value: string }>): string {
  return `<table style="width:100%;border-collapse:collapse;margin:20px 0">
    ${rows.map((r, i) => `<tr>
      <td style="padding:10px 0;color:#52525b;font-size:14px;border-top:${i === 0 ? "none" : "1px solid #e4e4e7"};width:120px">${r.label}</td>
      <td style="padding:10px 0;font-weight:600;font-size:14px;border-top:${i === 0 ? "none" : "1px solid #e4e4e7"}">${r.value}</td>
    </tr>`).join("")}
  </table>`;
}

function emailWrapper(content: string): string {
  return `<div style="max-width:520px;margin:0 auto;${BASE_STYLES}">${content}</div>`;
}

function customerEmailHtml(p: {
  customerName: string;
  businessName: string;
  serviceName: string;
  formattedDateLong: string;
  timeString: string;
  endTimeString: string;
  notes?: string;
  cancelUrl: string;
  googleCalUrl: string;
}): string {
  const rows = [
    { label: "Tjeneste", value: p.serviceName },
    { label: "Dato", value: p.formattedDateLong },
    { label: "Tidspunkt", value: `kl. ${p.timeString}–${p.endTimeString}` },
    ...(p.notes ? [{ label: "Merknad", value: p.notes }] : []),
  ];

  return emailWrapper(`
    <!-- Header -->
    <div style="background:#18181b;padding:20px 28px;border-radius:12px 12px 0 0">
      <span style="font-size:17px;font-weight:700;color:#fff;letter-spacing:-0.3px">Agenci</span>
    </div>

    <!-- Body -->
    <div style="background:#fff;border:1px solid #e4e4e7;border-top:none;padding:28px 28px 24px">
      <h2 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#18181b">Bestillingen din er bekreftet ✅</h2>
      <p style="margin:0 0 4px;color:#52525b;font-size:15px">Hei ${p.customerName},</p>
      <p style="margin:0;color:#52525b;font-size:15px">Din time hos <strong style="color:#18181b">${p.businessName}</strong> er registrert.</p>

      ${detailsTable(rows)}

      <!-- Calendar buttons -->
      <div style="background:#f4f4f5;border-radius:10px;padding:16px 20px;margin-bottom:20px">
        <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#18181b">📅 Legg til i kalenderen din</p>
        <a href="${p.googleCalUrl}" target="_blank"
           style="display:inline-block;background:#18181b;color:#fff;padding:9px 18px;border-radius:7px;text-decoration:none;font-size:13px;font-weight:600;margin-right:8px">
          Google Kalender
        </a>
        <span style="font-size:12px;color:#71717a">eller åpne vedlegget <strong>booking.ics</strong> for Apple/Outlook-kalender</span>
      </div>

      <hr style="margin:20px 0;border:none;border-top:1px solid #e4e4e7" />
      <p style="font-size:13px;color:#71717a;margin:0">
        Vil du avbestille? <a href="${p.cancelUrl}" style="color:#18181b">Klikk her for å avbestille timen</a>
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f4f4f5;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 12px 12px;padding:14px 28px">
      <p style="margin:0;font-size:11px;color:#a1a1aa">
        Sendt av <strong style="color:#71717a">Agenci</strong> på vegne av ${p.businessName} &nbsp;·&nbsp;
        <a href="https://agenci.no/personvern" style="color:#a1a1aa">Personvernerklæring</a>
      </p>
    </div>
  `);
}

function businessEmailHtml(p: {
  customerName: string;
  customerEmail: string;
  businessName: string;
  serviceName: string;
  formattedDateLong: string;
  timeString: string;
  endTimeString: string;
  notes?: string;
  googleCalUrl: string;
}): string {
  const rows = [
    { label: "Kunde", value: `${p.customerName} &lt;${p.customerEmail}&gt;` },
    { label: "Tjeneste", value: p.serviceName },
    { label: "Dato", value: p.formattedDateLong },
    { label: "Tidspunkt", value: `kl. ${p.timeString}–${p.endTimeString}` },
    ...(p.notes ? [{ label: "Merknad", value: p.notes }] : []),
  ];

  return emailWrapper(`
    <!-- Header -->
    <div style="background:#18181b;padding:20px 28px;border-radius:12px 12px 0 0">
      <span style="font-size:17px;font-weight:700;color:#fff;letter-spacing:-0.3px">Agenci</span>
      <span style="font-size:12px;color:#a1a1aa;margin-left:10px">for ${p.businessName}</span>
    </div>

    <!-- Body -->
    <div style="background:#fff;border:1px solid #e4e4e7;border-top:none;padding:28px 28px 24px">
      <h2 style="margin:0 0 6px;font-size:20px;font-weight:700;color:#18181b">Ny bestilling mottatt 📅</h2>
      <p style="margin:0;color:#52525b;font-size:15px">
        <strong style="color:#18181b">${p.customerName}</strong> har bestilt time via Agenci-chatten.
      </p>

      ${detailsTable(rows)}

      <!-- Calendar buttons -->
      <div style="background:#f4f4f5;border-radius:10px;padding:16px 20px;margin-bottom:20px">
        <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#18181b">📅 Legg til i din kalender</p>
        <a href="${p.googleCalUrl}" target="_blank"
           style="display:inline-block;background:#18181b;color:#fff;padding:9px 18px;border-radius:7px;text-decoration:none;font-size:13px;font-weight:600;margin-right:8px">
          Google Kalender
        </a>
        <span style="font-size:12px;color:#71717a">eller åpne vedlegget <strong>booking.ics</strong> for Apple/Outlook-kalender</span>
      </div>

      <p style="font-size:12px;color:#a1a1aa;margin:0">
        Administrer bestillinger i <a href="https://agenci.no/dashboard" style="color:#71717a">Agenci-dashboardet</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f4f4f5;border:1px solid #e4e4e7;border-top:none;border-radius:0 0 12px 12px;padding:14px 28px">
      <p style="margin:0;font-size:11px;color:#a1a1aa">
        Sendt av <strong style="color:#71717a">Agenci</strong> &nbsp;·&nbsp;
        <a href="https://agenci.no/personvern" style="color:#a1a1aa">Personvernerklæring</a>
      </p>
    </div>
  `);
}

// ── Action ────────────────────────────────────────────────────────────────────

export const sendBookingEmails = internalAction({
  args: {
    customerEmail: v.string(),
    customerName: v.string(),
    businessEmail: v.optional(v.string()),
    businessName: v.string(),
    serviceName: v.string(),
    durationMinutes: v.number(),
    dateString: v.string(),
    timeString: v.string(),
    cancellationToken: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from =
      process.env.RESEND_FROM_EMAIL?.trim() ?? "Agenci <noreply@agenci.no>";

    if (!apiKey) {
      console.info("[bookingEmail] Hopper over — mangler RESEND_API_KEY");
      return { sent: false };
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? "https://agenci.no";
    const cancelUrl = `${appUrl}/booking/avbestill?token=${args.cancellationToken}`;
    const formattedDate = formatDate(args.dateString);
    const formattedDateLong = formatDateLong(args.dateString);
    const endTimeString = addMinutes(args.timeString, args.durationMinutes);

    // Build ICS calendar invite
    const dtStart = toICSDate(args.dateString, args.timeString);
    const dtEnd = toICSDate(args.dateString, endTimeString);
    const icsContent = generateICS({
      uid: `${args.cancellationToken}@agenci.no`,
      dtStart,
      dtEnd,
      summary: `${args.serviceName} hos ${args.businessName}`,
      description: `Bestilling bekreftet. Avbestill: ${cancelUrl}`,
    });
    const icsAttachment = {
      filename: "booking.ics",
      content: btoa(icsContent),
    };

    // Google Calendar link
    const gcalUrl = googleCalendarUrl({
      title: `${args.serviceName} hos ${args.businessName}`,
      dtStart,
      dtEnd,
      details: `Bestilling bekreftet. Avbestill: ${cancelUrl}`,
    });

    // Customer email
    await sendEmail({
      apiKey,
      from,
      to: args.customerEmail,
      subject: `Bestilling bekreftet — ${args.serviceName} ${formattedDate} kl. ${args.timeString}`,
      html: customerEmailHtml({
        customerName: args.customerName,
        businessName: args.businessName,
        serviceName: args.serviceName,
        formattedDateLong,
        timeString: args.timeString,
        endTimeString,
        notes: args.notes,
        cancelUrl,
        googleCalUrl: gcalUrl,
      }),
      attachments: [icsAttachment],
    });

    // Business email (only if configured)
    if (args.businessEmail) {
      await sendEmail({
        apiKey,
        from,
        to: args.businessEmail,
        subject: `Ny bestilling: ${args.customerName} — ${args.serviceName} ${formattedDate} kl. ${args.timeString}`,
        html: businessEmailHtml({
          customerName: args.customerName,
          customerEmail: args.customerEmail,
          businessName: args.businessName,
          serviceName: args.serviceName,
          formattedDateLong,
          timeString: args.timeString,
          endTimeString,
          notes: args.notes,
          googleCalUrl: gcalUrl,
        }),
        attachments: [icsAttachment],
      });
    }

    return { sent: true };
  },
});
