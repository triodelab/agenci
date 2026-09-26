import * as Sentry from "@sentry/nextjs";

/** Statistics consent from Cookiebot's `CookieConsent` cookie. */
function statisticsConsent() {
  if (typeof document === "undefined") return false;
  const raw = document.cookie.match(/(?:^|;\s*)CookieConsent=([^;]*)/)?.[1];
  if (!raw) return false;
  try {
    return /statistics:\s*true/.test(decodeURIComponent(raw));
  } catch {
    return false;
  }
}

Sentry.init({
  dsn: "https://5089b2c668fa9f8e18478882aeca2cec@o4509747803848704.ingest.de.sentry.io/4509747901825104",

  // Session Replay stays off — requires explicit opt-in via consent dialog.
  integrations: [],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Performance tracing only if user accepted statistics cookies.
  tracesSampleRate: statisticsConsent() ? 0.2 : 0,
  enableLogs: true,
  debug: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;