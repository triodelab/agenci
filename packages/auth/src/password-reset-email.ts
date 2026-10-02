/**
 * "Nytt passord" e-mail, sent through Resend's HTTP API. Same look as the
 * team invitation; a plain-text part is included for clients without HTML.
 */

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === '"' ? "&quot;" : "&#39;",
  );

export async function sendPasswordResetViaResend(opts: {
  apiKey: string;
  from: string;
  to: string;
  name: string;
  link: string;
}) {
  const greeting = opts.name ? `Hei ${opts.name.split(/\s+/)[0]}!` : "Hei!";
  const subject = "Lag et nytt passord til Agenci";

  const text = [
    greeting,
    "",
    "Vi fikk en forespørsel om å lage nytt passord til Agenci-kontoen din.",
    "",
    "Trykk på lenken for å velge et nytt passord:",
    opts.link,
    "",
    "Lenken gjelder i 1 time og kan bare brukes én gang.",
    "",
    "Ba du ikke om dette? Da kan du se bort fra e-posten. Passordet ditt er ikke endret.",
  ].join("\n");

  const html = `<!doctype html>
<html lang="nb">
  <body style="margin:0;background:#f2f3f1;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#243236">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px">
      <tr><td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:20px;padding:32px">
          <tr><td style="font-size:20px;font-weight:600;letter-spacing:-0.02em">Agenci</td></tr>
          <tr><td style="padding-top:24px;font-size:22px;font-weight:600;letter-spacing:-0.02em">
            Lag et nytt passord
          </td></tr>
          <tr><td style="padding-top:10px;font-size:15px;line-height:1.6;color:#5a606a">
            ${escape(greeting)} Vi fikk en forespørsel om å lage nytt passord til Agenci-kontoen din.
          </td></tr>
          <tr><td style="padding-top:24px">
            <a href="${escape(opts.link)}" style="display:inline-block;background:#243236;color:#ffffff;text-decoration:none;font-size:15px;font-weight:500;padding:13px 24px;border-radius:999px">Velg nytt passord</a>
          </td></tr>
          <tr><td style="padding-top:24px;font-size:13px;line-height:1.6;color:#8a9096">
            Lenken gjelder i 1 time og kan bare brukes én gang.<br>
            Knappen virker ikke? Kopier denne lenken:<br>
            <a href="${escape(opts.link)}" style="color:#5a606a;word-break:break-all">${escape(opts.link)}</a>
          </td></tr>
        </table>
        <p style="max-width:480px;font-size:12px;color:#8a9096;line-height:1.6;margin:16px auto 0">
          Ba du ikke om dette? Da kan du se bort fra e-posten. Passordet ditt er ikke endret.
        </p>
      </td></tr>
    </table>
  </body>
</html>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${opts.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: opts.from, to: [opts.to], subject, html, text }),
  });
  if (!res.ok) {
    throw new Error(`Kunne ikke sende e-post om nytt passord (Resend ${res.status})`);
  }
}
