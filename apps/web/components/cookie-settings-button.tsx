"use client";

import { useCookieConsent } from "@/hooks/use-cookie-consent";

export function CookieSettingsButton() {
  const { reset } = useCookieConsent();

  return (
    <button
      type="button"
      onClick={reset}
      className="text-[12px] text-[#62666d] transition-colors hover:text-[#8a8f98]"
    >
      Cookie-innstillinger
    </button>
  );
}
