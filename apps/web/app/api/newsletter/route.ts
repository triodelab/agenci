import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Ugyldig e-post"),
});

/**
 * Stub: validerer e-post og returnerer OK. Koble til Convex / e-postleverandør senere.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Ugyldig e-post" },
        { status: 400 },
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
