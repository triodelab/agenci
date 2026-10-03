/**
 * Small in-memory rate limiter for the public (widget) API. One server
 * process, so memory is enough; counts reset when the server restarts.
 */
import { ORPCError } from "@orpc/server";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Drop expired buckets now and then so the map can't grow forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key);
}, 60_000).unref?.();

/** Throws TOO_MANY_REQUESTS when `key` has been used `max` times within `windowMs`. */
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  b.count += 1;
  if (b.count > max) {
    throw new ORPCError("TOO_MANY_REQUESTS", {
      message: "For mange meldinger på kort tid. Vent litt og prøv igjen.",
    });
  }
}

/** The visitor's IP as set by Caddy (the real one, from Cloudflare). */
export function clientIp(headers: Headers) {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
