/**
 * Remembers an invitation someone opened before they were logged in, so the
 * login / sign-up flow can send them straight back to accept it.
 */
const KEY = "agenci:pending-invite";

export function rememberInvite(invitationId: string) {
  try {
    window.sessionStorage.setItem(KEY, invitationId);
  } catch {
    // storage unavailable: they can open the link again after logging in
  }
}

export function takePendingInvite(): string | null {
  try {
    const id = window.sessionStorage.getItem(KEY);
    if (id) window.sessionStorage.removeItem(KEY);
    return id;
  } catch {
    return null;
  }
}
