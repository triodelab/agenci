import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkApiRateLimit, getClientIp } from "@/lib/api-rate-limit";
import { notifyTeamEmail } from "@/lib/notify-team-email";

const contactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(40).optional().or(z.literal("")),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(20000),
  /** Honeypot — skal være tom */
  company: z.string().max(100).optional(),
});

/**
 * Validerer kontaktskjema og sender valgfritt e-post til team (Resend) når miljø er satt.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkApiRateLimit({
      key: `contact:${ip}`,
      limit: 20,
      windowMs: 15 * 60 * 1000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "For mange forespørsler. Vent litt og prøv igjen." },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfterSec) },
        },
      );
    }

    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Ugyldig skjema" },
        { status: 400 },
      );
    }

    const { company, phone, ...rest } = parsed.data;
    if (company && company.trim().length > 0) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const payload = {
      ...rest,
      phone: phone?.trim() || undefined,
    };

    if (process.env.NODE_ENV === "development") {
      console.info("[contact]", payload);
    }

    const text = [
      `Navn: ${payload.name}`,
      `E-post: ${payload.email}`,
      payload.phone ? `Telefon: ${payload.phone}` : null,
      `Emne: ${payload.subject}`,
      "",
      payload.message,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await notifyTeamEmail({
        subject: `[Agenci kontakt] ${payload.subject}`,
        text,
      });
    } catch (err) {
      console.error("[contact] notifyTeamEmail", err);
      return NextResponse.json(
        { error: "Kunne ikke sende meldingen akkurat nå. Prøv igjen senere." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Kunne ikke sende meldingen." },
      { status: 500 },
    );
  }
}
