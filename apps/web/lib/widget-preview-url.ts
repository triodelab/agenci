/**
 * Base-URL for widget-appen (forhåndsvisning). Standard er lokal dev på 3001.
 * Sett `NEXT_PUBLIC_WIDGET_PREVIEW_ORIGIN` når du deployer widget til eget domene.
 */
export function getWidgetPreviewUrl(organizationId: string): string {
  const origin =
    process.env.NEXT_PUBLIC_WIDGET_PREVIEW_ORIGIN?.replace(/\/$/, "") ||
    "http://localhost:3001";
  return `${origin}/?organizationId=${encodeURIComponent(organizationId)}`;
}
