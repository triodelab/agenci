/**
 * Valgfri e-postvarsling via Resend (https://resend.com).
 * Sett RESEND_API_KEY + NOTIFY_TO_EMAIL i miljø for produksjon.
 */
export async function notifyTeamEmail(params: {
  subject: string;
  text: string;
}): Promise<{ sent: boolean; skippedReason?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.NOTIFY_TO_EMAIL?.trim() ?? "post@triodelab.no";
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ??
    "Agenci <onboarding@resend.dev>";

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.info(
        "[notify-team-email] Hopper over (mangler RESEND_API_KEY eller NOTIFY_TO_EMAIL)",
      );
    }
    return { sent: false, skippedReason: "missing_env" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject: params.subject,
      text: params.text,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend ${res.status}: ${body}`);
  }

  return { sent: true };
}
