"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  SparklesIcon,
  BookOpenIcon,
  BarChart2Icon,
  ArrowRightIcon,
} from "lucide-react";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { LANDING_AUTH_PATHS, LANDING_CONTACT_PAGE_PATH } from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

// ─── Data ─────────────────────────────────────────────────────────────────────

const VISUAL_SECTIONS = [
  {
    id: "dashboard-oversikt",
    step: "01",
    badge: "Innsikt",
    title: "Se hva som skjer — på ett sted",
    lead: "Dashboardet samler volum, trender og status. Dere ser raskt om kundene får svar i tide, hvor det butter, og hvor dere bør skjerpe innhold.",
    bullets: [
      "KPI-er og grafer gir felles bilde for ledelse og kundeservice.",
      "Prioritering ut fra faktisk bruk, ikke gjetting.",
    ],
    src: "/screenshot1.png",
    alt: "Agenci dashboard med oversikt og statistikk",
    imageFirst: true,
  },
  {
    id: "samtaler-koer",
    step: "02",
    badge: "Drift",
    title: "Samtaler og køer — én arbeidsflate",
    lead: "Alle henvendelser samles i samme struktur. Dere kan følge tråder, overta fra AI når det trengs, og sikre at ingen saker stopper mellom kanaler.",
    bullets: [
      "Historikk og kontekst på tvers av samtaler.",
      "Eskalering til menneske uten at kunden gjentar seg.",
    ],
    src: "/screenshot2.png",
    alt: "Agenci samtalevisning med køer og historikk",
    imageFirst: false,
  },
  {
    id: "oppsett-snarveier",
    step: "03",
    badge: "Kontroll",
    title: "Tilpass uten friksjon",
    lead: "Her finner dere snarveier til det som ofte justeres: retningslinjer, integrasjoner, utseende. Finjuster raskt — uten å vente på en utvikler.",
    bullets: [
      "Konsistent merkevare og tone i møte med kunden.",
      "Rask vei fra idé til endring i produktet.",
    ],
    src: "/screenshot3.png",
    alt: "Agenci oppsett og snarveier",
    imageFirst: true,
  },
] as const;

const PRACTICAL_STEPS = [
  {
    n: "01",
    icon: SparklesIcon,
    title: "Installer widget",
    body: "Én embed-kode på nettsiden. Widgeten er oppe på minutter — ingen tunge integrasjonsprosjekter.",
  },
  {
    n: "02",
    icon: BookOpenIcon,
    title: "Koble kunnskap",
    body: "Lim inn FAQ, produkttekster og retningslinjer. AI-en svarer kun innenfor det dere setter — ingen hallusinasjoner.",
  },
  {
    n: "03",
    icon: BarChart2Icon,
    title: "Styr og forbedre",
    body: "Følg samtaler live, ta over når det trengs, og optimaliser ut fra faktisk bruk. Skalerer med data — ikke kaos.",
  },
] as const;

// ─── View ─────────────────────────────────────────────────────────────────────

export function HvordanDetVirkerView() {
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <MarketingPageLayout>
      <HeroSection reduceMotion={reduceMotion} />
      <FlowSection reduceMotion={reduceMotion} />
      {VISUAL_SECTIONS.map((section, i) => (
        <VisualSection
          key={section.id}
          section={section}
          priority={i === 0}
          reduceMotion={reduceMotion}
        />
      ))}
      <PracticalSection reduceMotion={reduceMotion} />
      <CTASection reduceMotion={reduceMotion} />
    </MarketingPageLayout>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <section
      className="relative overflow-hidden bg-[#1C1C1C]"
      aria-labelledby="how-hero-heading"
    >
      <div className="relative mx-auto max-w-[1200px] px-6 pb-0 pt-24 text-center md:pt-32 xl:px-8">
        {/* Kicker */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
          className="mb-7 inline-flex items-center gap-2"
        >
          <span className="size-1.5 rounded-full bg-[#6b7280]" />
          <span className="font-mono text-[11px] font-medium tracking-[0.18em] text-[#6b7280] uppercase">
            Slik fungerer det
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          id="how-hero-heading"
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.07, ease }}
          className="mx-auto max-w-4xl text-[2.8rem] font-semibold leading-[1.06] tracking-[-0.055em] text-[#f2f3f5] sm:text-[3.6rem] md:text-[4.5rem]"
        >
          Fra widget på nettsiden
          <br />
          <span className="text-[#6b7280]">til full kontroll i dashboardet.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.16, ease }}
          className="mx-auto mt-6 max-w-xl text-[17px] leading-[1.65] text-[#6b7280]"
        >
          Agenci er bygget som en sammenhengende flyt: kunden møter dere på nettsiden,
          assistenten svarer ut fra deres kunnskap, og teamet styrer i dashboardet.
        </motion.p>

        {/* Anchor nav */}
        <motion.nav
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.26, ease }}
          className="mt-9 flex flex-wrap items-center justify-center gap-2"
          aria-label="Hopp til seksjon"
        >
          {VISUAL_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-[#2a2a2a] bg-[#161616] px-4 py-1.5 text-[12px] font-medium text-[#6b7280] transition-all duration-150 hover:border-[#3a3a3a] hover:text-[#f2f3f5]"
            >
              {s.badge}
            </a>
          ))}
        </motion.nav>

        {/* Dashboard hero image in browser frame */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.36, ease }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          {/* Browser chrome */}
          <div className="relative overflow-hidden rounded-t-[14px] border border-b-0 border-[#2a2a2a] shadow-[0_-4px_60px_-12px_rgba(0,0,0,0.5)]">
            {/* Chrome bar */}
            <div className="flex items-center gap-2 border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#ff5f57]" />
                <span className="size-2.5 rounded-full bg-[#febc2e]" />
                <span className="size-2.5 rounded-full bg-[#28c840]" />
              </div>
              <div className="mx-auto flex w-52 items-center justify-center gap-1.5 rounded-md bg-[#141414] py-1.5 px-3">
                <span className="size-2 rounded-full border border-[#333] bg-[#2a2a2a]" />
                <span className="text-[10px] tracking-tight text-[#4b5563]">app.agenci.no</span>
              </div>
            </div>
            {/* Screenshot */}
            <div className="relative aspect-[16/9] w-full bg-[#161616]">
              <Image
                src="/screenshot1.png"
                alt="Agenci dashboard oversikt"
                fill
                sizes="(max-width: 1024px) 100vw, 960px"
                priority
                className="object-cover object-top"
              />
              {/* Bottom fade into next section */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
                style={{
                  background: "linear-gradient(to bottom, transparent, #161616)",
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Flow ─────────────────────────────────────────────────────────────────────

const FLOW_STEPS = [
  { n: "01", label: "Widget",    sub: "Kunden møter dere på nettsiden" },
  { n: "02", label: "AI",        sub: "Svarer automatisk, døgnet rundt" },
  { n: "03", label: "Dashboard", sub: "Teamet ser og styrer alt" },
] as const;

function FlowSection({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <section className="border-y border-[#252525] bg-[#1C1C1C]">
      <div className="mx-auto max-w-[1200px] px-6 xl:px-8">
        <div className="grid divide-y divide-[#252525] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {FLOW_STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1, ease }}
              className="flex flex-col gap-2 px-8 py-12"
            >
              <span className="font-mono text-[11px] font-medium tracking-[0.2em] text-[#6b7280]">
                {step.n}
              </span>
              <p className="mt-1 text-[18px] font-semibold tracking-[-0.025em] text-[#f2f3f5]">
                {step.label}
              </p>
              <p className="text-[13px] leading-relaxed text-[#4b5563]">
                {step.sub}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Visual section ───────────────────────────────────────────────────────────

function VisualSection({
  section,
  priority,
  reduceMotion,
}: {
  section: (typeof VISUAL_SECTIONS)[number];
  priority: boolean;
  reduceMotion: boolean;
}) {
  const { id, step, badge, title, lead, bullets, src, alt, imageFirst } = section;

  const imageEl = (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: imageFirst ? -28 : 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, ease }}
      className="relative"
    >
      {/* Browser frame */}
      <div className="relative overflow-hidden rounded-[12px] border border-[#2a2a2a] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)]">
        {/* Chrome bar */}
        <div className="flex items-center gap-2 border-b border-[#2a2a2a] bg-[#1a1a1a] px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-[#ff5f57]" />
            <span className="size-2 rounded-full bg-[#febc2e]" />
            <span className="size-2 rounded-full bg-[#28c840]" />
          </div>
          <div className="mx-auto flex w-40 items-center justify-center gap-1 rounded bg-[#141414] py-1 px-3">
            <span className="size-1.5 rounded-full border border-[#333]" />
            <span className="text-[9px] text-[#4b5563]">app.agenci.no</span>
          </div>
        </div>
        {/* Screenshot */}
        <div className="relative aspect-[16/10] w-full bg-[#161616]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(max-width: 1024px) min(96vw, 640px), 520px"
            priority={priority}
            className="object-cover object-top"
          />
        </div>
      </div>
    </motion.div>
  );

  const textEl = (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: imageFirst ? 28 : -28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.75, delay: 0.1, ease }}
      className="flex flex-col justify-center"
    >
      {/* Step badge */}
      <div className="mb-5 flex items-center gap-2.5">
        <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-[#6b7280]">
          {step}
        </span>
        <span className="h-px w-5 bg-[#6b7280]/40" />
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#6b7280]">
          {badge}
        </span>
      </div>

      <h2 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.045em] text-[#f2f3f5] md:text-[2.5rem]">
        {title}
      </h2>

      <p className="mt-5 text-[15px] leading-[1.75] text-[#6b7280]">{lead}</p>

      <ul className="mt-7 space-y-3.5">
        {bullets.map((b, i) => (
          <motion.li
            key={b}
            initial={reduceMotion ? false : { opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.35 + i * 0.09, ease }}
            className="flex items-start gap-3 text-[14px] leading-[1.65] text-[#9ca3af]"
          >
            <span
              aria-hidden
              className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#6b7280]"
            />
            {b}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );

  return (
    <section
      id={id}
      className="relative scroll-mt-20 overflow-hidden border-t border-[#2a2a2a] bg-[#1C1C1C]"
    >
      {/* Giant decorative step number */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-0 select-none font-black leading-[0.9] text-[#222222]",
          "text-[22vw] sm:text-[18vw]",
          imageFirst ? "right-0" : "left-0",
        )}
      >
        {step}
      </span>

      <div className="relative mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">
          {imageFirst ? (
            <>
              {imageEl}
              {textEl}
            </>
          ) : (
            <>
              {textEl}
              {imageEl}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Practical steps ──────────────────────────────────────────────────────────

function PracticalSection({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <section className="border-t border-[#2a2a2a] bg-[#161616]">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">

        {/* Header */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease }}
          className="mb-16 max-w-xl"
        >
          <div className="mb-5 inline-flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-[#6b7280]" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#6b7280]">
              I praksis
            </span>
          </div>
          <h2 className="text-[2.25rem] font-semibold leading-[1.07] tracking-[-0.05em] text-[#f2f3f5] sm:text-[2.6rem]">
            Tre steg — fra tom side
            <br />
            <span className="text-[#6b7280]">til levende assistent.</span>
          </h2>
        </motion.div>

        {/* Step grid */}
        <div className="grid gap-px bg-[#2a2a2a] sm:grid-cols-3">
          {PRACTICAL_STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.45, delay: i * 0.1, ease }}
              className="group relative flex flex-col bg-[#161616] p-8 transition-colors duration-200 hover:bg-[#1a1a1a]"
            >
              <p className="relative mb-7 font-mono text-[11px] font-medium tracking-[0.2em] text-[#6b7280]">
                {step.n}
              </p>

              <div className="relative mb-6 flex size-11 items-center justify-center rounded-[10px] bg-white/[0.06] text-[#9ca3af] transition-colors duration-200 group-hover:bg-white/[0.09]">
                <step.icon className="size-5" strokeWidth={1.75} />
              </div>

              <h3 className="relative text-[19px] font-semibold leading-snug tracking-[-0.025em] text-[#f2f3f5]">
                {step.title}
              </h3>
              <p className="relative mt-3 text-[13px] leading-[1.7] text-[#6b7280]">
                {step.body}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTASection({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <section className="border-t border-[#2a2a2a] bg-[#1C1C1C]">
      <div className="mx-auto max-w-[1200px] px-6 py-24 md:py-32 xl:px-8">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.65, ease }}
          className="relative overflow-hidden rounded-[16px] border border-[#2a2a2a] bg-[#161616] px-8 py-16 text-center md:px-16 md:py-24"
        >
          {/* Top hairline highlight */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)",
            }}
          />

          <div className="relative">
            <div className="mb-5 inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[#6b7280]" />
              <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#6b7280]">
                Neste steg
              </span>
            </div>

            <h2 className="mx-auto max-w-2xl text-[2rem] font-semibold leading-[1.1] tracking-[-0.045em] text-[#f2f3f5] sm:text-[2.6rem]">
              Vil dere se Agenci
              <br />
              på deres egen nettside?
            </h2>

            <p className="mx-auto mt-5 max-w-md text-[15px] leading-[1.7] text-[#6b7280]">
              Opprett konto for å teste widget og dashboard, eller send oss en melding — vi hjelper med oppsett og nivå som passer volumet deres.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <AuthAwareLink
                href={LANDING_AUTH_PATHS.signUp}
                loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-white px-6 text-[14px] font-semibold text-[#1C1C1C] shadow-[0_4px_24px_-4px_rgba(255,255,255,0.2)] transition-all duration-150 hover:bg-[#f2f3f5]"
              >
                Kom i gang
                <ArrowRightIcon className="size-3.5" />
              </AuthAwareLink>
              <Link
                href={LANDING_CONTACT_PAGE_PATH}
                className="inline-flex h-10 items-center rounded-lg border border-[#2a2a2a] bg-transparent px-6 text-[14px] font-medium text-[#6b7280] transition-all duration-150 hover:border-[#3a3a3a] hover:text-[#9ca3af]"
              >
                Kontaktskjema
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
