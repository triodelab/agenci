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

function customerEmailHtml(p: {
  customerName: string;
  businessName: string;
  serviceName: string;
  formattedDateLong: string;
  formattedDate: string;
  timeString: string;
  endTimeString: string;
  notes?: string;
  cancelUrl: string;
  googleCalUrl: string;
}): string {
  const notesRow = p.notes
    ? `<tr>
        <td style="padding:10px 0 2px;color:#6b7280;font-size:13px;vertical-align:top;width:110px">Merknad</td>
        <td style="padding:10px 0 2px;font-size:13px;color:#111827;vertical-align:top">${p.notes}</td>
       </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="no">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

        <!-- Header -->
        <tr><td style="background:#0f0f0f;border-radius:12px 12px 0 0;padding:24px 32px">
          <span style="font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.3px">Agenci</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 32px 28px">

          <!-- Status badge -->
          <div style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:5px 14px;margin-bottom:20px">
            <span style="font-size:12px;font-weight:600;color:#15803d">✓ Bekreftet</span>
          </div>

          <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#111827;line-height:1.3">
            Bestillingen din er bekreftet
          </h1>
          <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6">
            Hei ${p.customerName}, din time hos <strong style="color:#111827">${p.businessName}</strong> er klar.
          </p>

          <!-- Booking card -->
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin-bottom:28px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0 6px;color:#6b7280;font-size:13px;width:110px">Tjeneste</td>
                <td style="padding:6px 0 6px;font-size:13px;font-weight:600;color:#111827">${p.serviceName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0 6px;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb">Dato</td>
                <td style="padding:6px 0 6px;font-size:13px;font-weight:600;color:#111827;border-top:1px solid #e5e7eb;text-transform:capitalize">${p.formattedDateLong}</td>
              </tr>
              <tr>
                <td style="padding:6px 0 6px;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb">Tidspunkt</td>
                <td style="padding:6px 0 6px;font-size:13px;font-weight:600;color:#111827;border-top:1px solid #e5e7eb">kl. ${p.timeString}–${p.endTimeString}</td>
              </tr>
              ${notesRow}
            </table>
          </div>

          <!-- CTA buttons -->
          <table cellpadding="0" cellspacing="0" style="margin-bottom:28px">
            <tr>
              <td style="padding-right:10px">
                <a href="${p.googleCalUrl}" target="_blank"
                   style="display:inline-block;background:#111827;color:#fff;padding:11px 20px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600">
                  📅 Legg til i Google Kalender
                </a>
              </td>
            </tr>
          </table>
          <p style="margin:0 0 4px;font-size:12px;color:#9ca3af">
            Et kalendervedlegg (.ics) er lagt ved denne e-posten og åpner automatisk i de fleste kalenderapper.
          </p>

          <!-- Cancel -->
          <div style="border-top:1px solid #e5e7eb;margin-top:24px;padding-top:20px">
            <p style="margin:0;font-size:13px;color:#9ca3af">
              Trenger du å avbestille?
              <a href="${p.cancelUrl}" style="color:#6b7280;text-decoration:underline">Klikk her for å avbestille timen</a>
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:16px 32px">
          <p style="margin:0;font-size:11px;color:#9ca3af">
            Sendt av <strong style="color:#6b7280">Agenci</strong> på vegne av ${p.businessName} &nbsp;·&nbsp;
            <a href="https://agenci.no/personvern" style="color:#9ca3af">Personvernerklæring</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
}): string {
  const notesRow = p.notes
    ? `<tr>
        <td style="padding:6px 0 6px;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb;width:110px">Merknad</td>
        <td style="padding:6px 0 6px;font-size:13px;color:#111827;border-top:1px solid #e5e7eb">${p.notes}</td>
       </tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="no">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

        <!-- Header -->
        <tr><td style="background:#0f0f0f;border-radius:12px 12px 0 0;padding:24px 32px">
          <span style="font-size:18px;font-weight:700;color:#fff;letter-spacing:-0.3px">Agenci</span>
          <span style="font-size:12px;color:#9ca3af;margin-left:10px">for ${p.businessName}</span>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px 32px 28px">

          <!-- Status badge -->
          <div style="display:inline-block;background:#eff6ff;border:1px solid #bfdbfe;border-radius:20px;padding:5px 14px;margin-bottom:20px">
            <span style="font-size:12px;font-weight:600;color:#1d4ed8">Ny bestilling</span>
          </div>

          <h1 style="margin:0 0 10px;font-size:22px;font-weight:700;color:#111827;line-height:1.3">
            Du har fått en ny bestilling
          </h1>
          <p style="margin:0 0 28px;font-size:15px;color:#6b7280;line-height:1.6">
            <strong style="color:#111827">${p.customerName}</strong> har bestilt time via Agenci-chatten.
          </p>

          <!-- Customer card -->
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af">Kunde</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin-bottom:20px">
            <p style="margin:0;font-size:14px;font-weight:600;color:#111827">${p.customerName}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6b7280">${p.customerEmail}</p>
          </div>

          <!-- Booking card -->
          <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af">Bestilling</p>
          <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin-bottom:28px">
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:13px;width:110px">Tjeneste</td>
                <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827">${p.serviceName}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb">Dato</td>
                <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;border-top:1px solid #e5e7eb;text-transform:capitalize">${p.formattedDateLong}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb">Tidspunkt</td>
                <td style="padding:6px 0;font-size:13px;font-weight:600;color:#111827;border-top:1px solid #e5e7eb">kl. ${p.timeString}–${p.endTimeString}</td>
              </tr>
              ${notesRow}
            </table>
          </div>

          <p style="margin:0;font-size:13px;color:#9ca3af">
            Administrer bestillinger i
            <a href="https://agenci.no/dashboard" style="color:#6b7280;text-decoration:underline">Agenci-dashboardet</a>
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;padding:16px 32px">
          <p style="margin:0;font-size:11px;color:#9ca3af">
            Sendt av <strong style="color:#6b7280">Agenci</strong> &nbsp;·&nbsp;
            <a href="https://agenci.no/personvern" style="color:#9ca3af">Personvernerklæring</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
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
        formattedDate,
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
        }),
        attachments: [icsAttachment],
      });
    }

    return { sent: true };
  },
});
