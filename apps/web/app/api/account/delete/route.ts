import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Ikke autentisert" }, { status: 401 });
  }

  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(userId);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[account/delete]", err);
    return NextResponse.json(
      { error: "Kunne ikke slette kontoen. Prøv igjen eller kontakt post@triodelab.no." },
      { status: 500 },
    );
  }
}
