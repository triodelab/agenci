/**
 * Shared "Demodata" switch. When on, the overview and the conversations pages
 * read the seeded demo set instead of the API, so their numbers agree.
 * On by default in local dev; the choice is remembered per browser.
 */
import { useSyncExternalStore } from "react";

const STORAGE_KEY = "agenci:overview-demo";
const listeners = new Set<() => void>();

function read(): boolean {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === null ? import.meta.env.DEV : saved === "1";
  } catch {
    return import.meta.env.DEV;
  }
}

let current = typeof window === "undefined" ? false : read();

export function isDemoMode() {
  return current;
}

export function setDemoMode(on: boolean) {
  current = on;
  try {
    window.localStorage.setItem(STORAGE_KEY, on ? "1" : "0");
  } catch {
    // storage unavailable — the switch still works for this visit
  }
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useDemoMode() {
  const on = useSyncExternalStore(subscribe, isDemoMode, () => false);
  return { on, toggle: () => setDemoMode(!on) };
}
