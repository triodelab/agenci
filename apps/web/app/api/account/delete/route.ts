/**
 * Task 1.2 — Account delete temporarily gated.
 * Full Better Auth deleteUser lands with email confirmation later.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-server";

export async function POST() {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
  }

  return NextResponse.json(
    {
      error:
        "Kontosletting via Better Auth er ikke aktivert ennå. Kontakt post@triodelab.no.",
    },
    { status: 501 },
  );
}
