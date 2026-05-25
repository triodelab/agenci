import { v } from "convex/values";
import { action } from "../_generated/server";

async function sendEmail(params: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: params.from,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split("-");
  return `${day}.${month}.${year}`;
}

export const sendBookingEmails = action({
  args: {
    customerEmail: v.string(),
    customerName: v.string(),
    businessEmail: v.string(),
    businessName: v.string(),
    serviceName: v.string(),
    dateString: v.string(),
    timeString: v.string(),
    cancellationToken: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from =
      process.env.RESEND_FROM_EMAIL?.trim() ?? "Agenci <post@triodelab.no>";

    if (!apiKey) {
      console.info("[bookingEmail] Hopper over — mangler RESEND_API_KEY");
      return { sent: false };
    }

    const formattedDate = formatDate(args.dateString);
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://agenci.no"}/booking/avbestill?token=${args.cancellationToken}`;

    // Email to customer
    await sendEmail({
      apiKey,
      from,
      to: args.customerEmail,
      subject: `Bestillingsbekreftelse — ${args.serviceName} ${formattedDate} kl. ${args.timeString}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#18181b">
          <h2 style="margin-bottom:8px">Bestillingen din er bekreftet! ✅</h2>
          <p style="color:#52525b">Hei ${args.customerName},</p>
          <p>Din bestilling hos <strong>${args.businessName}</strong> er registrert.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:8px 0;color:#52525b;font-size:14px">Tjeneste</td><td style="font-weight:600">${args.serviceName}</td></tr>
            <tr><td style="padding:8px 0;color:#52525b;font-size:14px">Dato</td><td style="font-weight:600">${formattedDate}</td></tr>
            <tr><td style="padding:8px 0;color:#52525b;font-size:14px">Tidspunkt</td><td style="font-weight:600">kl. ${args.timeString}</td></tr>
            ${args.notes ? `<tr><td style="padding:8px 0;color:#52525b;font-size:14px">Notater</td><td>${args.notes}</td></tr>` : ""}
          </table>
          <p style="font-size:14px;color:#71717a">Vil du avbestille? <a href="${cancelUrl}" style="color:#18181b">Klikk her for å avbestille</a></p>
          <hr style="margin:24px 0;border:none;border-top:1px solid #e4e4e7" />
          <p style="font-size:12px;color:#a1a1aa">Denne e-posten ble sendt automatisk av Agenci-assistenten. Ta kontakt med ${args.businessName} om du har spørsmål.</p>
        </div>
      `,
    });

    // Email to business
    await sendEmail({
      apiKey,
      from,
      to: args.businessEmail,
      subject: `Ny bestilling: ${args.customerName} — ${args.serviceName} ${formattedDate} kl. ${args.timeString}`,
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#18181b">
          <h2 style="margin-bottom:8px">Ny bestilling mottatt 📅</h2>
          <table style="width:100%;border-collapse:collapse;margin:20px 0">
            <tr><td style="padding:8px 0;color:#52525b;font-size:14px">Kunde</td><td style="font-weight:600">${args.customerName}</td></tr>
            <tr><td style="padding:8px 0;color:#52525b;font-size:14px">E-post</td><td style="font-weight:600">${args.customerEmail}</td></tr>
            <tr><td style="padding:8px 0;color:#52525b;font-size:14px">Tjeneste</td><td style="font-weight:600">${args.serviceName}</td></tr>
            <tr><td style="padding:8px 0;color:#52525b;font-size:14px">Dato</td><td style="font-weight:600">${formattedDate}</td></tr>
            <tr><td style="padding:8px 0;color:#52525b;font-size:14px">Tidspunkt</td><td style="font-weight:600">kl. ${args.timeString}</td></tr>
            ${args.notes ? `<tr><td style="padding:8px 0;color:#52525b;font-size:14px">Notater</td><td>${args.notes}</td></tr>` : ""}
          </table>
          <p style="font-size:12px;color:#a1a1aa">Administrer bestillinger i Agenci-dashboardet.</p>
        </div>
      `,
    });

    return { sent: true };
  },
});
