/**
 * Per-browser dashboard preferences (Innstillinger → Preferanser).
 * Kept in localStorage: they describe how this person likes the app to open,
 * not shared team data.
 */
export type StartPage = "agents" | "last-agent";
export type SidebarStart = "open" | "closed";

const KEYS = {
  startPage: "agenci:pref:start-page",
  sidebar: "agenci:pref:sidebar",
  lastAgent: "agenci:last-agent",
} as const;

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // storage unavailable: the default is used
  }
}

export const getStartPage = (): StartPage =>
  read(KEYS.startPage) === "last-agent" ? "last-agent" : "agents";
export const setStartPage = (v: StartPage) => write(KEYS.startPage, v);

export const getSidebarStart = (): SidebarStart =>
  read(KEYS.sidebar) === "closed" ? "closed" : "open";
export const setSidebarStart = (v: SidebarStart) => write(KEYS.sidebar, v);

/** The agent last opened, per organization, for "Startside: sist brukte agent". */
export function rememberLastAgent(orgSlug: string, agentId: string) {
  write(KEYS.lastAgent, JSON.stringify({ orgSlug, agentId }));
}

export function getLastAgent(): { orgSlug: string; agentId: string } | null {
  try {
    const v = JSON.parse(read(KEYS.lastAgent) ?? "null");
    return v?.orgSlug && v?.agentId ? v : null;
  } catch {
    return null;
  }
}
