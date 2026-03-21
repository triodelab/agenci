"use client";

import {
  Gemini,
  GooglePaLM,
  MagicUI,
  MediaWiki,
  Replit,
  VSCodium,
} from "@/components/logos";
import { InfiniteSlider } from "@/components/motion-primitives/infinite-slider";
import { LANDING_SECTION_IDS } from "@/modules/landing/constants";
import {
  LandingGradientText,
  landingIconSurfaceClassName,
} from "@/modules/landing/ui/components/landing-gradient-text";
import { LandingSectionHeader } from "@/modules/landing/ui/components/landing-section-header";
import { cn } from "@workspace/ui/lib/utils";
import {
  BookOpen,
  Code2,
  Database,
  Globe2,
  Handshake,
  Languages,
  LayoutDashboard,
  Lock,
  Server,
  Shield,
  Sparkles,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { LandingDashboardPreview } from "./landing-dashboard-preview";

const journey = [
  {
    n: "01",
    title: "Installer",
    text: "Én embed — widgeten er live på hele nettstedet.",
    icon: Code2,
  },
  {
    n: "02",
    title: "Koble data",
    text: "FAQ, dokumentasjon og rutiner blir grunnlaget for svar.",
    icon: Database,
  },
  {
    n: "03",
    title: "Styr alt",
    text: "Samtaler, utseende og innsikt — samlet i dashboard.",
    icon: LayoutDashboard,
  },
] as const;

const bento = [
  {
    title: "24/7 uten å ofre kvalitet",
    desc: "Kundene får svar når teamet er offline — innenfor reglene dere setter.",
    icon: Globe2,
    className: "md:col-span-2 lg:col-span-2 lg:row-span-1",
  },
  {
    title: "Human handoff",
    desc: "Overdragelse til agent når tonen eller saken krever det.",
    icon: Handshake,
    className: "md:col-span-1",
  },
  {
    title: "Merkevare og tema",
    desc: "Lys, mørk og egne farger — widgeten føles som dere.",
    icon: Sparkles,
    className: "md:col-span-1",
  },
  {
    title: "Ordre & logistikk",
    desc: "Levering, sporingsinfo og forventet ankomst — på norsk.",
    icon: BookOpen,
    className: "md:col-span-1",
  },
  {
    title: "Flere språk",
    desc: "Samme motor, tilpasset marked og tone.",
    icon: Languages,
    className: "md:col-span-1",
  },
  {
    title: "Trygg drift",
    desc: "Kryptering, EU/EØS og tydelig eierskap til policy.",
    icon: Shield,
    className: "md:col-span-2 lg:col-span-2",
  },
] as const;

const trustLine = [
  { icon: Shield, label: "GDPR-fokus" },
  { icon: Lock, label: "TLS 1.3" },
  { icon: Server, label: "EU / EØS" },
  { icon: LayoutDashboard, label: "Du eier innhold" },
] as const;

export function LandingProductOverviewSection() {
  const reduced = useReducedMotion();
  const logos = [VSCodium, MediaWiki, GooglePaLM, Gemini, Replit, MagicUI, Gemini, Replit];

  return (
    <section
      id={LANDING_SECTION_IDS.product}
      aria-labelledby="product-heading"
      className="relative scroll-mt-24 border-b border-border/40 bg-background"
    >
      <div
        aria-hidden
        className="landing-section-mesh pointer-events-none absolute inset-0 -z-10 opacity-50"
      />

      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28">
        <LandingSectionHeader
          eyebrow="Produkt"
          titleId="product-heading"
          title={
            <>
              Én plattform for{" "}
              <LandingGradientText>kundeservice som skalerer</LandingGradientText>
            </>
          }
          description="Widget for besøkende, motor for kunnskap og dashboard for teamet — uten å stable tre verktøy oppå hverandre."
        />

        <ol className="mt-14 grid gap-4 sm:grid-cols-3 md:mt-16 md:gap-5">
          {journey.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.li
                key={s.n}
                initial={reduced ? false : { opacity: 0, y: 16 }}
                whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
                className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-b from-card to-card/40 p-5 dark:from-card/80 dark:to-card/30 md:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl",
                      landingIconSurfaceClassName(),
                    )}
                  >
                    <Icon className="size-4" strokeWidth={2} />
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold md:text-lg">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </motion.li>
            );
          })}
        </ol>

        <div className="mt-20 md:mt-24">
          <div className="mx-auto max-w-2xl text-center md:max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Forhåndsvisning
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
              Slik jobber teamet{" "}
              <LandingGradientText className="inline">i Agenci</LandingGradientText>
            </h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Tilpass widget, se samtaler og bytt mellom lys og mørk modus — samme logikk som i produktet.
              Les mer på{" "}
              <Link href="/produkt" className="font-medium text-foreground underline-offset-4 hover:underline">
                produktsiden
              </Link>
              .
            </p>
          </div>

          <div className="relative left-1/2 mt-12 w-screen max-w-[100vw] -translate-x-1/2 px-4 sm:px-6 lg:px-10">
            <LandingDashboardPreview
              comfortable
              className="mx-auto max-w-[min(100%,88rem)] shadow-[0_40px_120px_-40px_rgba(0,0,0,0.2)] dark:shadow-[0_40px_120px_-40px_rgba(0,0,0,0.55)]"
            />
          </div>
        </div>

        <div className="mt-20 md:mt-24">
          <h3 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Hva du får
          </h3>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 lg:gap-4">
            {bento.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={reduced ? false : { opacity: 0, y: 12 }}
                  whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className={cn(
                    "rounded-2xl border border-border/50 bg-background/90 p-5 shadow-sm dark:bg-card/50 md:p-6",
                    item.className,
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex size-10 items-center justify-center rounded-xl",
                      landingIconSurfaceClassName(),
                    )}
                  >
                    <Icon className="size-5" strokeWidth={2} />
                  </span>
                  <p className="mt-4 text-base font-semibold tracking-tight">{item.title}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div id={LANDING_SECTION_IDS.integrations} className="scroll-mt-28 pt-20 md:pt-24">
          <LandingSectionHeader
            eyebrow="Økosystem"
            title={<LandingGradientText>Integrasjoner</LandingGradientText>}
            description="Koble til verktøy dere allerede bruker. Vi bygger ut — dere velger tempo."
            className="max-w-2xl"
          />
          <div className="relative mx-auto mt-10 max-w-4xl">
            <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-border to-transparent" />
            <div className="[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
              <InfiniteSlider gap={24} speed={22} speedOnHover={10}>
                {logos.map((Logo, idx) => (
                  <div
                    key={`${Logo.name}-${idx}`}
                    className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-card shadow-sm md:size-14"
                  >
                    <div className="*:size-5 md:*:size-6">
                      <Logo />
                    </div>
                  </div>
                ))}
              </InfiniteSlider>
            </div>
          </div>
        </div>

        <div
          id={LANDING_SECTION_IDS.trust}
          className="scroll-mt-28 mt-16 flex flex-wrap items-center justify-center gap-2.5 md:mt-20 md:gap-3"
        >
          {trustLine.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/25 px-4 py-2 text-xs font-medium backdrop-blur-sm"
            >
              <Icon className="size-3.5 text-muted-foreground" strokeWidth={2} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
