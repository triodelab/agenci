"use client";

import { useEffect } from "react";

type Cookiebot = { hasResponse?: boolean };

/**
 * Locks page scrolling while Cookiebot's centred consent dialog is open,
 * and releases it as soon as the visitor accepts or declines.
 */
export function CookiebotScrollLock() {
  useEffect(() => {
    const root = document.documentElement;
    const lock = () => {
      root.style.overflow = "hidden";
    };
    const unlock = () => {
      root.style.overflow = "";
    };

    // The dialog may already be showing before this component hydrates.
    const cb = (window as unknown as { Cookiebot?: Cookiebot }).Cookiebot;
    if (cb && cb.hasResponse === false && document.getElementById("CybotCookiebotDialog")) {
      lock();
    }

    window.addEventListener("CookiebotOnDialogDisplay", lock);
    window.addEventListener("CookiebotOnAccept", unlock);
    window.addEventListener("CookiebotOnDecline", unlock);
    return () => {
      window.removeEventListener("CookiebotOnDialogDisplay", lock);
      window.removeEventListener("CookiebotOnAccept", unlock);
      window.removeEventListener("CookiebotOnDecline", unlock);
      unlock();
    };
  }, []);

  return null;
}
