/**
 * Live preview bridge for the dashboard's widget customization page.
 *
 * With `?preview=1` the widget runs inside an iframe in the dashboard. It
 * tells the parent it is ready, then applies every draft the dashboard posts
 * as a preview override (see `widgetPreviewOverrideAtom`) — nothing is saved.
 * Messages are only accepted from the dashboard origin.
 */
import { useSetAtom } from "jotai";
import { useEffect } from "react";
import {
  type WidgetSettingsPublic,
  widgetPreviewOverrideAtom,
} from "@/modules/widget/atoms/widget-atoms";

type PreviewMessage = {
  type: "agenci:widget-preview";
  settings: Partial<WidgetSettingsPublic>;
};

function allowedOrigin(origin: string) {
  const configured = import.meta.env.VITE_DASHBOARD_URL as string | undefined;
  if (configured && origin === configured.replace(/\/$/, "")) return true;
  // Local development: any localhost port (dashboard runs on :3004).
  return import.meta.env.DEV && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function isPreviewMessage(data: unknown): data is PreviewMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { type?: unknown }).type === "agenci:widget-preview" &&
    typeof (data as { settings?: unknown }).settings === "object"
  );
}

export function usePreviewBridge(enabled: boolean) {
  const setOverride = useSetAtom(widgetPreviewOverrideAtom);

  useEffect(() => {
    if (!enabled || window.parent === window) return;
    const onMessage = (event: MessageEvent) => {
      if (!allowedOrigin(event.origin) || !isPreviewMessage(event.data)) return;
      setOverride(event.data.settings);
    };
    window.addEventListener("message", onMessage);
    // Ask the dashboard for the current draft.
    window.parent.postMessage({ type: "agenci:widget-ready" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, [enabled, setOverride]);
}
