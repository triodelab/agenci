/**
 * Team invitation e-mail, sent through Resend's HTTP API (no SDK needed).
 * Norwegian copy; a plain-text part is included for clients without HTML.
 */

const ROLE_LABEL: Record<string, string> = {
  owner: "eier",
  admin: "admin",
  member: "medlem",
};

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );

export async function sendInvitationViaResend(opts: {
  apiKey: string;
  from: string;
  to: string;
  organization: string;
  inviter: string;
  role: string;
  link: string;
}) {
  const role = ROLE_LABEL[opts.role] ?? opts.role;
  const subject = `${opts.inviter} har invitert deg til ${opts.organization} på Agenci`;

  const text = [
    "Hei!",
    "",
    `${opts.inviter} har invitert deg til teamet ${opts.organization} på Agenci, som ${role}.`,
    "",
    "Trykk på lenken for å bli med:",
    opts.link,
    "",
    "Lenken gjelder i 48 timer. Har du ikke konto, lager du en med denne e-postadressen.",
    "",
    "Var ikke dette til deg? Da kan du se bort fra e-posten.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="nb">
  <body style="margin:0;background:#f2f3f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#243236">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;padding:32px">
          <tr><td style="font-size:20px;font-weight:600;letter-spacing:-0.02em">Agenci</td></tr>
          <tr><td style="padding-top:24px;font-size:22px;font-weight:600;letter-spacing:-0.02em">
            Bli med i ${escape(opts.organization)}
          </td></tr>
          <tr><td style="padding-top:10px;font-size:15px;line-height:1.6;color:#5a606a">
            ${escape(opts.inviter)} har invitert deg til teamet på Agenci, som <strong style="color:#243236">${escape(role)}</strong>.
          </td></tr>
          <tr><td style="padding-top:24px">
            <a href="${escape(opts.link)}" style="display:inline-block;background:#243236;color:#ffffff;text-decoration:none;font-size:15px;font-weight:500;padding:13px 24px;border-radius:999px">Bli med i teamet</a>
          </td></tr>
          <tr><td style="padding-top:24px;font-size:13px;line-height:1.6;color:#8a9096">
            Lenken gjelder i 48 timer. Har du ikke konto, lager du en med denne e-postadressen.<br>
            Knappen virker ikke? Kopier denne lenken:<br>
            <a href="${escape(opts.link)}" style="color:#5a606a;word-break:break-all">${escape(opts.link)}</a>
          </td></tr>
        </table>
        <p style="max-width:480px;font-size:12px;color:#8a9096;line-height:1.6;margin:16px auto 0">
          Var ikke dette til deg? Da kan du se bort fra e-posten.
        </p>
      </td></tr>
    </table>
  </body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: opts.from, to: [opts.to], subject, html, text }),
  });
  if (!res.ok) {
    // Surface the failure to the inviter instead of pretending it was sent.
    throw new Error(`Kunne ikke sende invitasjonen på e-post (Resend ${res.status})`);
  }
}
