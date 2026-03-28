import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

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
 * Validerer og aksepterer kontaktskjema. Koble til e-post (Resend), Slack eller CRM i produksjon.
 */
export async function POST(req: NextRequest) {
  try {
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

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Kunne ikke sende meldingen." },
      { status: 500 },
    );
  }
}
