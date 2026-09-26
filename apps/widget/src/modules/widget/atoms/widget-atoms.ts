import type { WidgetAppearance } from "@workspace/ui/lib/widget-appearance";
import { atom } from "jotai";
import { atomFamily, atomWithStorage } from "jotai/utils";
import type { WidgetScreen } from "@/modules/widget/types";
import {
  CONTACT_SESSION_KEY,
  CONVERSATION_KEY,
  SESSION_ANONYMOUS_KEY,
} from "../constants";

export const screenAtom = atom<WidgetScreen>("loading");
export const organizationIdAtom = atom<string | null>(null);
export const agentIdAtom = atom<string | null>(null);
export const contactSessionIdAtomFamily = atomFamily(
  (organizationId: string) => {
    return atomWithStorage<string | null>(
      `${CONTACT_SESSION_KEY}_${organizationId}`,
      null,
    );
  },
);
export const errorMessageAtom = atom<string | null>(null);
export const loadingMessageAtom = atom<string | null>(null);
/** Holds the Mastra thread id once a conversation has started (see `server/router` `widget.chat.send`). */
export const conversationIdAtomFamily = atomFamily((organizationId: string) =>
  atomWithStorage<string | null>(`${CONVERSATION_KEY}_${organizationId}`, null),
);

/** Matches `WidgetSettingsResponseSchema` in `apps/server/src/modules/widget/schema.ts`. */
export type WidgetSettingsPublic = {
  agentId: string | null;
  agentName: string | null;
  widgetTitle: string | null;
  /** First assistant message; null → the built-in greeting. */
  greeting?: string | null;
  faviconUrl: string | null;
  appearance: Partial<WidgetAppearance> | null;
  hideBranding: boolean;
  bookingEnabled: boolean;
  vapiSettings: {
    assistantId: string | null;
    phoneNumber: string | null;
  } | null;
  defaultSuggestions: {
    suggestion1: string | null;
    suggestion2: string | null;
    suggestion3: string | null;
  };
};

/** Settings as loaded from the server. */
const widgetSettingsBaseAtom = atom<WidgetSettingsPublic | null>(null);

/**
 * Live overrides from the dashboard's customization preview (`?preview=1`,
 * sent via postMessage). Never set in production embeds.
 */
export const widgetPreviewOverrideAtom =
  atom<Partial<WidgetSettingsPublic> | null>(null);

/**
 * What every screen reads: server settings with any preview override on top.
 * Writing sets the server value, so the loader is unchanged.
 */
export const widgetSettingsAtom = atom(
  (get): WidgetSettingsPublic | null => {
    const base = get(widgetSettingsBaseAtom);
    const preview = get(widgetPreviewOverrideAtom);
    if (!base || !preview) return base;
    return {
      ...base,
      ...preview,
      appearance: { ...(base.appearance ?? {}), ...(preview.appearance ?? {}) },
      defaultSuggestions: preview.defaultSuggestions ?? base.defaultSuggestions,
    };
  },
  (_get, set, next: WidgetSettingsPublic | null) => {
    set(widgetSettingsBaseAtom, next);
  },
);
export const sessionIsAnonymousAtomFamily = atomFamily(
  (organizationId: string) =>
    atomWithStorage<boolean>(
      `${SESSION_ANONYMOUS_KEY}_${organizationId}`,
      false,
    ),
);
