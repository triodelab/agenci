"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { Menu, X } from "lucide-react";
import { useUser } from "@/lib/auth-hooks";
import { cn } from "@workspace/ui/lib/utils";
import { AgenciNavWordmark } from "@/components/logo";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_NAV_PRIMARY_LINKS,
  LANDING_NAV_SURFACE_ATTR,
  LANDING_NAV_TONE_BOUNDARY_ID,
} from "@/modules/landing/constants";
import styles from "./landing-nav.module.css";

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
  return boundary.getBoundingClientRect().top <= NAV_HEIGHT_PX
    ? "light"
    : "dark";
}

export function LandingNav({ variant = "dark" }: LandingNavProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [autoSurface, setAutoSurface] = useState<"dark" | "light">("dark");
  const { user, isLoaded } = useUser();
  const navRef = useRef<HTMLElement>(null);
  const [navHover, setNavHover] = useState({
    left: 0,
    right: 0,
    visible: false,
    instant: true,
  });

  /* Hover-pillen glir mellom hovedlenkene: ett lag bak lenkene, klippet til
     lenken under pekeren. Kommer pekeren utenfra, hopper klippet rett dit og
     pillen tones inn — den glir bare mellom lenker. Kun mus/penn; berøring og
     tastatur får ingen glideanimasjon. */
  const showNavHover = (event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    const nav = navRef.current;
    if (!nav) return;
    const link = event.currentTarget;
    const left = link.offsetLeft;
    const right = nav.clientWidth - (link.offsetLeft + link.offsetWidth);
    setNavHover((current) => ({
      left,
      right,
      visible: true,
      instant: !current.visible,
    }));
  };
  const hideNavHover = () =>
    setNavHover((current) => ({ ...current, visible: false }));

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

  const showScrolledGradient = variant === "auto" && scrolled;
  const isDark =
    showScrolledGradient ||
    (variant === "light" ? false : variant === "dark" ? true : autoSurface === "dark");

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300",
        showScrolledGradient
          ? styles.scrolledGradient
          : variant === "auto"
            ? "border-b border-transparent bg-transparent"
            : isDark
            ? scrolled
              ? "border-b border-[#2a2a2a] bg-[#1C1C1C]/96 backdrop-blur-md"
              : "border-b border-transparent bg-transparent"
            : "border-b border-border/50 bg-background/95 backdrop-blur-sm shadow-sm",
      )}
    >
      <div className="agenci-bleed-row mx-auto flex h-[4.25rem] max-w-[1600px] items-center justify-between gap-4 px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="Agenci — hjem"
        >
          <AgenciNavWordmark surface={isDark ? "dark" : "light"} />
        </Link>

        {/* Center nav */}
        {/* Lenkene ligger kant i kant (ingen gap): mellomrommet ligger inne i
            hver lenke (px-[13px] = gammel px-3 + halve gap-0.5), så pekeren
            aldri faller i et dødt felt mellom dem og pillen blinker av. */}
        <nav
          ref={navRef}
          onPointerLeave={hideNavHover}
          className="relative hidden items-center lg:flex"
          aria-label="Hovedlenker"
        >
          <span
            aria-hidden="true"
            className={cn(
              styles.navHover,
              showScrolledGradient
                ? "bg-white/[0.12]"
                : isDark
                ? "bg-white/[0.07]"
                : "bg-muted/70",
            )}
            data-visible={navHover.visible || undefined}
            data-instant={navHover.instant || undefined}
            style={{
              clipPath: `inset(0 ${navHover.right}px 0 ${navHover.left}px round 6px)`,
            }}
          />
          {LANDING_NAV_PRIMARY_LINKS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onPointerEnter={showNavHover}
              className={cn(
                "relative z-[1] rounded-md px-[13px] py-2 text-[13px] font-medium transition-colors",
                showScrolledGradient
                  ? "text-white/90 hover:text-white"
                  : isDark
                  ? "text-[#b8bfca] hover:text-white"
                  : "text-muted-foreground hover:text-foreground",
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
                showScrolledGradient
                  ? "text-white/90 hover:bg-white/[0.12] hover:text-white"
                  : isDark
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
                showScrolledGradient
                  ? "text-white/90 hover:bg-white/[0.12] hover:text-white"
                  : isDark
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
                "hidden h-9 items-center justify-center rounded-full border px-[18px] text-[13px] font-medium transition-colors sm:inline-flex",
                showScrolledGradient
                  ? "border-white/70 text-white hover:border-white hover:bg-white/[0.12]"
                  : isDark
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
              showScrolledGradient
                ? "text-white hover:bg-white/[0.12]"
                : isDark
                ? "text-[#9ca3af] hover:bg-white/10"
                : "text-foreground hover:bg-muted",
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
          "absolute right-4 top-[4.25rem] z-50 w-60 rounded-xl border shadow-2xl lg:hidden",
          "bg-[#1a1a1a] border-[#2a2a2a]",
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
              className="rounded-xl px-3 py-3 text-[14px] font-medium text-[#d1d5db] hover:bg-white/[0.07] hover:text-white"
            >
              {item.name}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-[#2a2a2a] pt-3">
            {isLoaded && user ? (
              <Link
                href={LANDING_AUTH_PATHS.appHome}
                onClick={() => setOpen(false)}
                className="flex h-9 items-center justify-center rounded-full border border-[#2a2a2a] text-[13px] font-medium text-[#d1d5db] hover:bg-white/[0.07]"
              >
                Dashboard
              </Link>
            ) : isLoaded ? (
              <>
                <Link
                  href={LANDING_AUTH_PATHS.signIn}
                  onClick={() => setOpen(false)}
                  className="flex h-9 items-center justify-center rounded-full border border-[#2a2a2a] text-[13px] font-medium text-[#d1d5db] hover:bg-white/[0.07]"
                >
                  Logg inn
                </Link>
                <AuthAwareLink
                  href={LANDING_AUTH_PATHS.signUp}
                  loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
                  onClick={() => setOpen(false)}
                  className="flex h-9 items-center justify-center rounded-full bg-white text-[13px] font-semibold text-[#1C1C1C] hover:bg-[#f2f3f5]"
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
