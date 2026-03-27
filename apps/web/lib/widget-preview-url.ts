/**
 * Base-URL for widget-appen (forhåndsvisning). Standard er lokal dev på 3001.
 * Sett `NEXT_PUBLIC_WIDGET_PREVIEW_ORIGIN` når du deployer widget til eget domene.
 *
 * `playground: true` — widget åpner direkte i chat (dashboard playground), ikke «Start chat»-skjermen.
 */
export function getWidgetPreviewUrl(
  organizationId: string,
  options?: { playground?: boolean },
): string {
  const origin =
    process.env.NEXT_PUBLIC_WIDGET_PREVIEW_ORIGIN?.replace(/\/$/, "") ||
    "http://localhost:3001";
  const u = new URL(`${origin}/`);
  u.searchParams.set("organizationId", organizationId);
  if (options?.playground) {
    u.searchParams.set("playground", "1");
  }
  return u.toString();
}
