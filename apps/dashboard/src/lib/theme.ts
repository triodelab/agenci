/**
 * Light / dark mode for the dashboard (Innstillinger → Preferanser → Utseende).
 * The choice lives in localStorage; "system" follows the OS. `index.html`
 * applies the stored theme before React loads, so there is no white flash.
 */
import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";

const KEY = "agenci:pref:theme";
const media = () => window.matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set<() => void>();

export function getTheme(): Theme {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

/** The theme actually shown ("system" resolved against the OS). */
export function resolvedTheme(theme = getTheme()): "light" | "dark" {
  return theme === "system" ? (media().matches ? "dark" : "light") : theme;
}

function apply() {
  const dark = resolvedTheme() === "dark";
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  for (const l of listeners) l();
}

export function setTheme(theme: Theme) {
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    // storage blocked: still switch for this visit
  }
  apply();
}

/** Call once at startup: applies the theme and follows OS changes. */
export function initTheme() {
  apply();
  media().addEventListener("change", () => {
    if (getTheme() === "system") apply();
  });
}

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

/** Current choice + what is shown, re-rendering when either changes. */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "system" as Theme);
  const resolved = useSyncExternalStore(
    subscribe,
    () => resolvedTheme(),
    () => "light" as const,
  );
  return { theme, resolved, setTheme };
}
