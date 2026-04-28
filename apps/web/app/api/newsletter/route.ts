import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkApiRateLimit, getClientIp } from "@/lib/api-rate-limit";
import { notifyTeamEmail } from "@/lib/notify-team-email";

const newsletterSchema = z.object({
  email: z.string().email("Ugyldig e-post"),
});

/**
 * Nyhetsbrev: validerer e-post og varsler team via Resend når RESEND_API_KEY + NOTIFY_TO_EMAIL er satt.
 */
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const rl = checkApiRateLimit({
      key: `newsletter:${ip}`,
      limit: 12,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.ok) {
      return NextResponse.json(
        { error: "For mange forsøk. Prøv igjen senere." },
        {
          status: 429,
          headers: { "Retry-After": String(rl.retryAfterSec) },
        },
      );
    }

    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Ugyldig e-post" },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    if (process.env.NODE_ENV === "development") {
      console.info("[newsletter]", email);
    }

    try {
      const result = await notifyTeamEmail({
        subject: "[Agenci] Ny påmelding til nyhetsbrev",
        text: `Ny påmelding:\n${email}\n\n(Legg til i e-postliste / CRM manuelt inntil automatisert flyt er på plass.)`,
      });
      if (!result.sent && process.env.NODE_ENV === "production") {
        console.warn(
          "[newsletter] Ingen e-post sendt — sett RESEND_API_KEY og NOTIFY_TO_EMAIL for å motta påmeldinger.",
        );
      }
    } catch (err) {
      console.error("[newsletter] notifyTeamEmail", err);
      return NextResponse.json(
        { error: "Kunne ikke melde deg på akkurat nå. Prøv igjen senere." },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Kunne ikke melde deg på. Prøv igjen senere." },
      { status: 500 },
    );
  }
}
