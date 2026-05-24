"use client";

import { useCookieConsent } from "@/hooks/use-cookie-consent";

export function CookieSettingsButton() {
  const { reset } = useCookieConsent();

  return (
    <button
      type="button"
      onClick={reset}
      className="text-[12px] text-[#4b5563] transition-colors hover:text-[#6b7280]"
    >
      Cookie-innstillinger
    </button>
  );
}
