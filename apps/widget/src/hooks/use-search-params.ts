import { useMemo } from "react";

/**
 * Drop-in replacement for `next/navigation`'s `useSearchParams` in this
 * plain-React SPA: the widget is embedded once per iframe load and never
 * navigates client-side, so reading `location.search` once per mount is
 * enough — no listener/sync needed.
 */
export function useSearchParams(): URLSearchParams {
  return useMemo(() => new URLSearchParams(window.location.search), []);
}
