"use client";

import { useEffect, useState } from "react";

export type ConsentState = {
  necessary: true;
  statistics: boolean;
  marketing: boolean;
  preferences: boolean;
};

type StoredConsent = ConsentState & {
  version: number;
  timestamp: number;
};

export const CONSENT_VERSION = 1;
export const STORAGE_KEY = "agenci_cookie_consent";

export function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.version !== CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(state: Omit<ConsentState, "necessary">): void {
  const stored: StoredConsent = {
    version: CONSENT_VERSION,
    necessary: true,
    statistics: state.statistics,
    marketing: state.marketing,
    preferences: state.preferences,
    timestamp: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  window.dispatchEvent(new CustomEvent("agenci-consent-updated", { detail: stored }));
}

export function resetConsent(): void {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("agenci-consent-updated", { detail: null }));
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<StoredConsent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setConsent(readStoredConsent());

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as StoredConsent | null;
      setConsent(detail);
    };
    window.addEventListener("agenci-consent-updated", handler);
    return () => window.removeEventListener("agenci-consent-updated", handler);
  }, []);

  const save = (state: Omit<ConsentState, "necessary">) => {
    writeConsent(state);
    setConsent(readStoredConsent());
  };

  const acceptAll = () => save({ statistics: true, marketing: true, preferences: true });
  const acceptNecessary = () => save({ statistics: false, marketing: false, preferences: false });

  return {
    consent,
    mounted,
    hasConsented: mounted && consent !== null,
    save,
    acceptAll,
    acceptNecessary,
    reset: resetConsent,
  };
}
