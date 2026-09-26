"use client";

/** Opens Cookiebot's consent dialog so visitors can change their choice. */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() =>
        (window as unknown as { Cookiebot?: { renew: () => void } }).Cookiebot?.renew()
      }
      className="text-[12px] text-[#4b5563] transition-colors hover:text-[#6b7280]"
    >
      Cookie-innstillinger
    </button>
  );
}
