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
  LANDING_HERO_WORKFLOW_LEAD,
  LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS,
  LANDING_NAV_TONE_BOUNDARY_ID,
  LANDING_SECTION_IDS,
  landingSectionHref,
} from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";

const HERO_ROTATE_MS = 2000;

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
            "object-cover object-top [image-rendering:auto] transition-opacity duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            i === index ? "z-[1] opacity-100" : "z-0 opacity-0",
          )}
        />
      ))}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-[min(22%,120px)] bg-gradient-to-r from-black from-[18%] via-black/55 to-transparent sm:w-[min(18%,100px)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-[min(22%,120px)] bg-gradient-to-l from-black from-[18%] via-black/55 to-transparent sm:w-[min(18%,100px)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[32%] bg-gradient-to-t from-[#0a0a0a] from-[20%] via-[#0a0a0a]/75 to-transparent"
      />

      <div
        className="pointer-events-auto absolute bottom-3 left-1/2 z-[5] flex -translate-x-1/2 gap-2 md:bottom-4"
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
              "h-1.5 rounded-full transition-[width,background-color] duration-500 ease-out",
              i === index ? "w-7 bg-white/85" : "w-1.5 bg-white/35 hover:bg-white/55",
            )}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Referanse: ren svart hero → skarp linje til hvitt. Podium ~40 % i sort sone, ~60 % i hvitt.
 * Undertekst + «Book en demo» ligger på hvitt rett under sokkelen (som i design).
 */
export function LandingHeroSection() {
  return (
    <section
      className="relative overflow-x-visible pt-[4.25rem]"
      aria-labelledby="landing-hero-heading"
    >
      {/* Mørk sone — dyp nøytral base (ikke ren svart), linje for podium */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(64vh,700px)] bg-[#050507] sm:h-[min(62vh,660px)] lg:h-[min(64vh,680px)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 bg-white top-[min(64vh,700px)] sm:top-[min(62vh,660px)] lg:top-[min(64vh,680px)]"
      />
      {/* Subtil vertikal dybde */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(64vh,700px)] bg-[linear-gradient(180deg,rgba(255,255,255,0.025)_0%,transparent_42%,rgba(0,0,0,0.2)_100%)] sm:h-[min(62vh,660px)] lg:h-[min(64vh,680px)]"
      />
      {/* Myk atmosfære — store, lavmettede blobs som spres utover hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[min(64vh,700px)] bg-[radial-gradient(ellipse_120%_85%_at_50%_-25%,rgba(45,212,191,0.07),transparent_58%)] sm:h-[min(62vh,660px)] lg:h-[min(64vh,680px)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[min(64vh,700px)] bg-[radial-gradient(ellipse_90%_70%_at_95%_20%,rgba(56,189,248,0.045),transparent_52%)] sm:h-[min(62vh,660px)] lg:h-[min(64vh,680px)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[min(64vh,700px)] bg-[radial-gradient(ellipse_85%_65%_at_5%_35%,rgba(20,184,166,0.035),transparent_55%)] sm:h-[min(62vh,660px)] lg:h-[min(64vh,680px)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[min(64vh,700px)] bg-[radial-gradient(ellipse_75%_55%_at_50%_85%,rgba(99,102,241,0.04),transparent_60%)] sm:h-[min(62vh,660px)] lg:h-[min(64vh,680px)]"
      />
      {/* Ekstra myk glød bak typografi (bred, lav intensitet) */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[min(18%,140px)] z-[1] h-[min(70vw,560px)] w-[min(130vw,960px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.055)_0%,rgba(56,189,248,0.03)_38%,transparent_68%)] blur-[64px]"
      />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center px-5 pt-10 text-center sm:px-6 md:max-w-4xl md:pt-14 lg:pt-16">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-teal-300/75 md:text-xs">
          KI-chat for nettsiden deres
        </p>
        <h1
          id="landing-hero-heading"
          className="mt-4 text-balance text-[2rem] font-semibold leading-[1.12] tracking-[-0.035em] text-white sm:text-4xl md:mt-5 md:text-5xl md:leading-[1.08] lg:text-[3.125rem]"
        >
          Svar kundene på nettsiden — døgnet rundt — uten ekstra ansatte
        </h1>
        <p className="mt-5 max-w-[34rem] text-pretty text-[15px] leading-[1.65] text-zinc-400/95 md:mt-6 md:text-lg md:leading-relaxed">
          Agenci er en innebygd chat som bruker kunnskapen deres (FAQ, dokumenter, produkttekster) til å
          svare presist. Besøkende får hjelp med én gang; teamet ser alt i dashboardet og kan ta over når
          det trengs.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
          <Button
            size="lg"
            className={cn(
              LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS,
              "h-12 min-w-[11rem] rounded-full px-8 text-[15px] shadow-[0_0_48px_-14px_rgba(45,212,191,0.28),0_18px_40px_-18px_rgba(45,212,191,0.18)]",
            )}
            asChild
          >
            <AuthAwareLink
              href={LANDING_AUTH_PATHS.signUp}
              loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
            >
              Opprett konto
            </AuthAwareLink>
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className="h-12 gap-1 rounded-full px-4 text-[15px] font-medium text-white hover:bg-white/[0.08] hover:text-white"
            asChild
          >
            <Link href="/produkt" className="inline-flex items-center gap-1">
              Se produktet
              <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      {/* Podium (uten ekstra bak-kort); bilde ~40 % over sort/hvit-linje, ~60 % under (inkl. sokkel) */}
      <div className="relative z-20 mx-auto mt-4 w-full px-2 sm:mt-6 sm:px-4 md:mt-8 lg:mt-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-2 left-1/2 z-0 h-[min(32vw,280px)] w-[min(92%,520px)] -translate-x-1/2 rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgba(45,212,191,0.09),rgba(56,189,248,0.04)_45%,transparent_72%)] blur-[72px] md:blur-[84px]"
        />

        <div className="relative z-10 mx-auto w-[min(96vw,1200px)] max-w-full">
          <div className="relative overflow-hidden rounded-[16px] bg-[#0a0a0a] p-[2px] shadow-[0_0_0_1px_rgba(255,255,255,0.055),0_28px_72px_-28px_rgba(0,0,0,0.88),0_48px_120px_-48px_rgba(45,212,191,0.08)] ring-1 ring-white/[0.08] md:rounded-[20px] md:p-[3px]">
            <div className="relative overflow-hidden rounded-t-[12px] bg-[#0a0a0a] md:rounded-t-[16px]">
              <HeroDashboardRotator
                className="h-[min(48vh,430px)] w-full sm:h-[min(52vh,480px)] md:h-[min(56vh,540px)] lg:h-[min(60vh,600px)]"
                sizes="(max-width: 960px) 96vw, 1200px"
              />
            </div>

            <div className="border-t border-white/[0.07] bg-[#0a0a0a]" aria-hidden>
              <div className="h-1.5 bg-gradient-to-b from-white/[0.04] to-transparent md:h-2" />
              <div className="h-2 bg-gradient-to-b from-black/30 to-[#050505] md:h-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Hvit sone under podium — som i design (undertekst + Book en demo før feature-grid) */}
      <div
        id={LANDING_NAV_TONE_BOUNDARY_ID}
        className="relative z-20 bg-white px-4 pb-2 pt-8 sm:px-6 sm:pt-10 md:pb-4 md:pt-12"
      >
        <p className="mx-auto max-w-2xl text-pretty text-center text-[15px] leading-relaxed text-zinc-600 md:max-w-3xl md:text-lg md:leading-relaxed">
          {LANDING_HERO_WORKFLOW_LEAD}
        </p>
        <div className="mt-6 flex justify-center md:mt-8">
          <Button
            size="lg"
            className={cn(
              LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS,
              "h-12 min-w-[10.5rem] rounded-full px-8 text-[15px] shadow-[0_14px_36px_-14px_rgba(45,212,191,0.22)]",
            )}
            asChild
          >
            <Link href={landingSectionHref("contact")}>Book en demo</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
