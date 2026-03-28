"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { AgenciNavWordmark } from "@/components/logo";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_ACCENT_CTA_BG,
  LANDING_AUTH_PATHS,
  LANDING_NAV_PRIMARY_LINKS,
  LANDING_NAV_SURFACE_ATTR,
  LANDING_NAV_TONE_BOUNDARY_ID,
  LANDING_SECTION_IDS,
} from "@/modules/landing/constants";

const ctaStyle = {
  backgroundColor: LANDING_ACCENT_CTA_BG,
} as const;

/** Høyde på fixed header — må matche `h-[4.25rem]` (scroll-terskel for tone) */
const NAV_HEIGHT_PX = 68;

type LandingNavProps = {
  /**
   * `dark` / `light` = statisk.
   * `auto` = lys nav når toppen av viewport er over hvit seksjon, mørk over hero eller footer.
   */
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
  const br = boundary.getBoundingClientRect();
  if (br.top <= NAV_HEIGHT_PX) {
    return "light";
  }
  return "dark";
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

  const effectiveIsDark =
    variant === "light" ? false : variant === "dark" ? true : autoSurface === "dark";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,border-color] duration-300",
        effectiveIsDark
          ? scrolled
            ? "border-b border-white/[0.06] bg-black shadow-[0_12px_40px_-12px_rgba(0,0,0,0.85)]"
            : "border-b border-transparent bg-transparent"
          : "border-b border-border/60 bg-background shadow-sm",
      )}
    >
      <div className="mx-auto grid h-[4.25rem] max-w-7xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 px-4 md:px-8 lg:px-10">
        <Link
          href="/"
          className={cn(
            "flex w-fit min-w-0 items-center font-semibold tracking-tight",
            effectiveIsDark ? "text-white" : "text-foreground",
          )}
          aria-label="Agenci — hjem"
        >
          <AgenciNavWordmark surface={effectiveIsDark ? "dark" : "light"} />
        </Link>

        <nav className="hidden justify-center lg:flex" aria-label="Hovedlenker">
          <div className="flex items-center gap-0.5 xl:gap-1">
            {LANDING_NAV_PRIMARY_LINKS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors xl:px-3.5",
                  effectiveIsDark
                    ? "text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-100"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>

        <div className="flex shrink-0 items-center justify-end gap-2 md:gap-3">
          {isLoaded && user ? (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "hidden sm:inline-flex text-[13px]",
                effectiveIsDark && "text-zinc-300 hover:bg-white/[0.07] hover:text-white",
              )}
              asChild
            >
              <Link href={LANDING_AUTH_PATHS.appHome}>Dashboard</Link>
            </Button>
          ) : isLoaded ? (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "hidden sm:inline-flex text-[13px]",
                effectiveIsDark && "text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-100",
              )}
              asChild
            >
              <Link href={LANDING_AUTH_PATHS.signIn}>Logg inn</Link>
            </Button>
          ) : null}

          {isLoaded && !user ? (
            <Button
              size="sm"
              className="hidden rounded-full px-5 font-semibold text-neutral-950 shadow-[0_8px_24px_-6px_rgba(45,212,191,0.45)] hover:opacity-95 sm:inline-flex"
              style={ctaStyle}
              asChild
            >
              <AuthAwareLink
                href={LANDING_AUTH_PATHS.signUp}
                loggedInHref={LANDING_AUTH_PATHS.appHome}
              >
                Opprett konto
              </AuthAwareLink>
            </Button>
          ) : null}

          <button
            type="button"
            className={cn(
              "inline-flex rounded-lg p-2 lg:hidden",
              effectiveIsDark
                ? "text-white hover:bg-white/10"
                : "text-foreground hover:bg-muted",
            )}
            aria-expanded={open}
            aria-controls="landing-nav-mobile"
            aria-label={open ? "Lukk meny" : "Åpne meny"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      <div
        id="landing-nav-mobile"
        className={cn(
          "border-t lg:hidden",
          effectiveIsDark ? "border-white/10 bg-black/90 backdrop-blur-xl" : "border-border bg-background",
          open ? "block" : "hidden",
        )}
      >
        <nav
          className="flex max-h-[min(70vh,calc(100dvh-5rem))] flex-col gap-1 overflow-y-auto px-4 py-4"
          aria-label="Mobilmeny"
        >
          {LANDING_NAV_PRIMARY_LINKS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "rounded-xl px-3 py-3 text-base font-medium",
                effectiveIsDark
                  ? "text-zinc-300 hover:bg-white/10 hover:text-white"
                  : "text-foreground hover:bg-muted",
              )}
              onClick={() => setOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div
            className={cn(
              "mt-3 flex flex-col gap-2 border-t pt-4",
              effectiveIsDark ? "border-white/10" : "border-border",
            )}
          >
            {isLoaded && user ? (
              <Button variant="outline" className="w-full rounded-xl" asChild>
                <Link href={LANDING_AUTH_PATHS.appHome}>Dashboard</Link>
              </Button>
            ) : isLoaded ? (
              <>
                <Button variant="outline" className="w-full rounded-xl" asChild>
                  <Link href={LANDING_AUTH_PATHS.signIn}>Logg inn</Link>
                </Button>
                <Button
                  className="w-full rounded-full font-semibold text-neutral-950"
                  style={ctaStyle}
                  asChild
                >
                  <AuthAwareLink
                    href={LANDING_AUTH_PATHS.signUp}
                    loggedInHref={LANDING_AUTH_PATHS.appHome}
                  >
                    Opprett konto
                  </AuthAwareLink>
                </Button>
              </>
            ) : null}
          </div>
        </nav>
      </div>
    </header>
  );
}
