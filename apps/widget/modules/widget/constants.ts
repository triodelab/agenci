export const WIDGET_SCREENS = [
  "error",
  "loading",
  "selection",
  "voice",
  "auth",
  "inbox",
  "chat",
  "contact",
  "booking",
] as const;

export const CONTACT_SESSION_KEY = "echo_contact_session";
/** Lagrer aktiv samtale per org slik at widget ikke oppretter ny rad ved hver oppstart */
export const CONVERSATION_KEY = "echo_conversation";
