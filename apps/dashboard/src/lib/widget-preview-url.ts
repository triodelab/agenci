/**
 * Widget preview URL for dashboard playground / integrations.
 * Override with `VITE_WIDGET_PREVIEW_ORIGIN` when the widget is hosted elsewhere.
 */
export function getWidgetPreviewUrl(
  organizationId: string,
  options?: { playground?: boolean; agentId?: string },
): string {
  const origin =
    import.meta.env.VITE_WIDGET_PREVIEW_ORIGIN?.replace(/\/$/, "") ||
    "http://localhost:3001";
  const url = new URL(`${origin}/`);
  url.searchParams.set("organizationId", organizationId);
  if (options?.playground) {
    url.searchParams.set("playground", "1");
  }
  if (options?.agentId) {
    url.searchParams.set("agentId", options.agentId);
  }
  return url.toString();
}
