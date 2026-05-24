"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { cn } from "@workspace/ui/lib/utils";
import { AgenciNavWordmark } from "@/components/logo";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_NAV_PRIMARY_LINKS,
  LANDING_NAV_SURFACE_ATTR,
  LANDING_NAV_TONE_BOUNDARY_ID,
} from "@/modules/landing/constants";

const NAV_HEIGHT_PX = 68;

type LandingNavProps = {
  variant?: "dark" | "light" | "auto";
};

function readAutoSurfaceTone(): "dark" | "light" {
  if (typeof document === "undefined") return "dark";
  const x = window.innerWidth / 2;
  const y = NAV_HEIGHT_PX / 2;
  const surfaces = document.querySelectorAll(`[${LANDING_NAV_SURFACE_ATTR}]`);
  for (const el of surfaces) {
    const r = el.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      const s = el.getAttribute(LANDING_NAV_SURFACE_ATTR);
      return s === "light" ? "light" : "dark";
    }
  }
  const boundary = document.getElementById(LANDING_NAV_TONE_BOUNDARY_ID);
  if (!boundary) return "dark";
  return boundary.getBoundingClientRect().top <= NAV_HEIGHT_PX ? "light" : "dark";
}

export function LandingNav({ variant = "dark" }: LandingNavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [autoSurface, setAutoSurface] = useState<"dark" | "light">("dark");
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useLayoutEffect(() => {
    if (variant !== "auto") return;
    const sync = () => setAutoSurface(readAutoSurfaceTone());
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync, { passive: true });
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [variant]);

  const isDark =
    variant === "light" ? false : variant === "dark" ? true : autoSurface === "dark";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300",
        isDark
          ? scrolled
            ? "border-b border-[#2a2a2a] bg-[#1C1C1C]/96 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
          : "border-b border-border/50 bg-background/95 backdrop-blur-sm shadow-sm",
      )}
    >
      <div className="mx-auto flex h-[4.25rem] max-w-[1200px] items-center justify-between gap-4 px-6 xl:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Agenci — hjem"
        >
          <AgenciNavWordmark surface={isDark ? "dark" : "light"} />
        </Link>

        {/* Center nav */}
        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Hovedlenker">
          {LANDING_NAV_PRIMARY_LINKS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                isDark
                  ? "text-[#b8bfca] hover:bg-white/[0.07] hover:text-white"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex shrink-0 items-center gap-2">
          {isLoaded && user ? (
            <Link
              href={LANDING_AUTH_PATHS.appHome}
              className={cn(
                "hidden rounded-md px-3 py-2 text-[13px] font-medium transition-colors sm:inline-flex",
                isDark
                  ? "text-[#b8bfca] hover:bg-white/[0.07] hover:text-white"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              Dashboard
            </Link>
          ) : isLoaded ? (
            <Link
              href={LANDING_AUTH_PATHS.signIn}
              className={cn(
                "hidden rounded-md px-3 py-2 text-[13px] font-medium transition-colors sm:inline-flex",
                isDark
                  ? "text-[#b8bfca] hover:bg-white/[0.07] hover:text-white"
                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              Logg inn
            </Link>
          ) : null}

          {isLoaded && !user && (
            <AuthAwareLink
              href={LANDING_AUTH_PATHS.signUp}
              loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
              className={cn(
                "hidden h-9 items-center justify-center rounded-[8px] border px-[18px] text-[13px] font-medium transition-colors sm:inline-flex",
                isDark
                  ? "border-white/45 text-white hover:border-white/75 hover:bg-white/[0.08]"
                  : "border-border bg-foreground text-background hover:bg-foreground/90",
              )}
            >
              Kom i gang
            </AuthAwareLink>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="landing-nav-mobile"
            aria-label={open ? "Lukk meny" : "Åpne meny"}
            className={cn(
              "inline-flex rounded-lg p-2 lg:hidden",
              isDark ? "text-[#9ca3af] hover:bg-white/10" : "text-foreground hover:bg-muted",
            )}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="landing-nav-mobile"
        className={cn(
          "absolute right-4 top-[4.25rem] z-50 w-60 rounded-xl border shadow-xl lg:hidden",
          isDark
            ? "border-[#2a2a2a] bg-[#1C1C1C]/97 backdrop-blur-xl"
            : "border-border bg-background",
          open ? "block" : "hidden",
        )}
      >
        <nav
          className="flex max-h-[min(70vh,calc(100dvh-5rem))] flex-col gap-0.5 overflow-y-auto px-3 py-3"
          aria-label="Mobilmeny"
        >
          {LANDING_NAV_PRIMARY_LINKS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "rounded-xl px-3 py-3 text-[14px] font-medium",
                isDark
                  ? "text-[#d1d5db] hover:bg-white/[0.07] hover:text-[#f9fafb]"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {item.name}
            </Link>
          ))}
          <div className={cn("mt-2 flex flex-col gap-2 border-t pt-3", isDark ? "border-[#2a2a2a]" : "border-border")}>
            {isLoaded && user ? (
              <Link
                href={LANDING_AUTH_PATHS.appHome}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex h-9 items-center justify-center rounded-xl text-[13px] font-medium",
                  isDark ? "border border-[#2a2a2a] text-[#d1d5db] hover:bg-white/[0.07]" : "border border-border text-foreground",
                )}
              >
                Dashboard
              </Link>
            ) : isLoaded ? (
              <>
                <Link
                  href={LANDING_AUTH_PATHS.signIn}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-xl border text-[13px] font-medium",
                    isDark ? "border-[#2a2a2a] text-[#d1d5db] hover:bg-white/[0.07]" : "border-border text-foreground",
                  )}
                >
                  Logg inn
                </Link>
                <AuthAwareLink
                  href={LANDING_AUTH_PATHS.signUp}
                  loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex h-9 items-center justify-center rounded-xl border text-[13px] font-semibold",
                    isDark
                      ? "border-[#e5e7eb]/25 text-[#e5e7eb] hover:border-[#e5e7eb]/50 hover:bg-white/[0.07]"
                      : "bg-foreground text-background hover:bg-foreground/90",
                  )}
                >
                  Kom i gang
                </AuthAwareLink>
              </>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
