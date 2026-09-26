export const WIDGET_SCREENS = ["error", "loading", "auth", "chat"] as const;

export const CONTACT_SESSION_KEY = "echo_contact_session";
/** Lagrer aktiv samtale per org slik at widget ikke oppretter ny rad ved hver oppstart */
export const CONVERSATION_KEY = "echo_conversation";
/** Markerer om gjeldende sesjon ble opprettet anonymt (uten navn/e-post) */
export const SESSION_ANONYMOUS_KEY = "echo_session_anonymous";
