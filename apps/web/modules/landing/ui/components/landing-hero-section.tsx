"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Button } from "@workspace/ui/components/button";
import { AuthAwareLink } from "@/components/auth-aware-link";
import {
  LANDING_AUTH_PATHS,
  LANDING_NAV_TONE_BOUNDARY_ID,
  LANDING_SECTION_IDS,
  landingSectionHref,
} from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";

const HERO_ROTATE_MS = 2400;

const HERO_DASHBOARD_SLIDES = [
  { src: "/screenshot1.png", label: "Innsikt: volum, trender og status" },
  { src: "/screenshot2.png", label: "Samtaler: kø, historikk og overtagelse" },
  { src: "/screenshot3.png", label: "Oppsett: widget, utseende og snarveier" },
] as const;

function HeroDashboardRotator({
  className,
  sizes,
}: {
  className: string;
  sizes: string;
}) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HERO_DASHBOARD_SLIDES.length);
    }, HERO_ROTATE_MS);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div
      className={cn("relative", className)}
      role="region"
      aria-roledescription="karusell"
      aria-label="Dashboard-forhåndsvisning"
    >
      {HERO_DASHBOARD_SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt=""
          fill
          sizes={sizes}
          priority={i === 0}
          loading={i === 0 ? undefined : "lazy"}
          aria-hidden={i !== index}
          className={cn(
            "object-cover object-top transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            i === index ? "z-[1] opacity-100" : "z-0 opacity-0",
          )}
        />
      ))}

      {/* Edge fades — must match the surface-1 panel bg (#0f1011) */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[10%] bg-gradient-to-r from-[#0f1011] to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[10%] bg-gradient-to-l from-[#0f1011] to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-1/4 bg-gradient-to-t from-[#0f1011] to-transparent" />

      {/* Slide dots */}
      <div
        className="pointer-events-auto absolute bottom-3 left-1/2 z-[5] flex -translate-x-1/2 gap-1.5"
        role="tablist"
        aria-label="Velg forhåndsvisning"
      >
        {HERO_DASHBOARD_SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={slide.label}
            tabIndex={i === index ? 0 : -1}
            className={cn(
              "h-[3px] rounded-full transition-[width,opacity] duration-500",
              i === index ? "w-5 bg-[#f7f8f8]/70" : "w-[3px] bg-[#f7f8f8]/20 hover:bg-[#f7f8f8]/35",
            )}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

export function LandingHeroSection() {
  return (
    <section
      className="relative overflow-hidden bg-[#010102] pt-[4.25rem]"
      aria-labelledby="landing-hero-heading"
      id={LANDING_NAV_TONE_BOUNDARY_ID}
      data-landing-nav-surface="dark"
    >
      {/* ── Hero text ── */}
      <div className="mx-auto max-w-[1200px] px-6 pt-16 md:pt-24 lg:pt-28 xl:px-8">

        {/*
          display-xl spec: 80px · weight 600 · line-height 1.05 · letter-spacing -3px
          -3px at 80px = -0.0375em. Scale down on smaller viewports toward display-md (40px).
        */}
        <h1
          id="landing-hero-heading"
          className="max-w-4xl text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.038em] text-[#f7f8f8] sm:text-[3.5rem] md:text-[5rem] lg:text-[5.5rem]"
        >
          Aldri mer tapte kunder.
        </h1>

        {/*
          Subtext: body-lg spec (18px · weight 400 · -0.1px tracking · #d0d6e0 ink-muted).
          Announcement link right-side — matches Linear's "Issue tracking is dead →" pattern.
        */}
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-lg text-[18px] leading-[1.5] tracking-[-0.01em] text-[#d0d6e0]">
            AI-chat for nettsiden din — svarer med dine egne ord, hele døgnet.
          </p>
          <Link
            href={landingSectionHref("workflow")}
            className="inline-flex shrink-0 items-center gap-2 text-[13px] font-medium text-[#8a8f98] transition-colors hover:text-[#f7f8f8]"
          >
            <span className="size-1.5 rounded-full bg-[#5e6ad2]" />
            Se hvordan det fungerer
            <ChevronRight className="size-3.5" strokeWidth={1.75} />
          </Link>
        </div>

        {/*
          CTAs — button-inverse (white) as primary, button-tertiary as ghost.
          rounded-[8px] = Linear rounded.md. Never rounded-full on CTAs.
          padding: 8px 14px per spec.
        */}
        <div className="mt-8 flex items-center gap-2.5">
          <Button
            className="h-9 rounded-[8px] bg-[#f7f8f8] px-[14px] text-[14px] font-medium text-[#010102] transition-colors hover:bg-white"
            asChild
          >
            <AuthAwareLink
              href={LANDING_AUTH_PATHS.signUp}
              loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
            >
              Kom i gang gratis
            </AuthAwareLink>
          </Button>
          <Button
            variant="ghost"
            className="h-9 rounded-[8px] px-[14px] text-[14px] font-medium text-[#8a8f98] hover:bg-[#0f1011] hover:text-[#f7f8f8]"
            asChild
          >
            <Link href={landingSectionHref("contact")}>Book en demo</Link>
          </Button>
        </div>
      </div>

      {/*
        ── Screenshot panel ──
        product-screenshot-card spec: surface-1 bg · rounded-xl (16px) · hairline border.
        Linear resists drop shadows on dark — no heavy shadows.
        NO atmospheric gradients per DESIGN.md "Don't" rules.
      */}
      <div className="mx-auto mt-14 max-w-[1200px] px-4 md:mt-20 xl:px-8">
        <div className="overflow-hidden rounded-[16px] border border-[#23252a] bg-[#0f1011]">
          {/* Minimal window chrome */}
          <div className="flex h-9 items-center gap-1.5 border-b border-[#23252a] px-4">
            <span className="size-2 rounded-full bg-[#34343a]" />
            <span className="size-2 rounded-full bg-[#34343a]" />
            <span className="size-2 rounded-full bg-[#34343a]" />
          </div>
          <HeroDashboardRotator
            className="h-[min(48vh,420px)] w-full sm:h-[min(52vh,460px)] md:h-[min(56vh,520px)] lg:h-[min(62vh,600px)]"
            sizes="(max-width: 960px) 96vw, 1200px"
          />
        </div>
      </div>

      {/* Lead text below screenshot */}
      <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-12 md:pb-28 xl:px-8">
        <p className="max-w-2xl text-[16px] leading-[1.75] text-[#d0d6e0]">
          Du svarer sannsynligvis de samme spørsmålene hver eneste dag. Åpningstider, priser,
          leveringstid, returpolicy. Agenci gjør det for deg — på nettsiden, hele døgnet — med
          svarene du selv har skrevet.
        </p>
      </div>
    </section>
  );
}
