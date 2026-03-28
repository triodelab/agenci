import type { Metadata } from "next";
import Image from "next/image";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { MarketingSubpageCta } from "@/modules/landing/ui/components/marketing-subpage-cta";
import { LANDING_MARKETING_EYEBROW_CLASS } from "@/modules/landing/constants";
import { cn } from "@workspace/ui/lib/utils";
import { BookOpen, LayoutDashboard, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Slik fungerer det",
  description:
    "Se hvordan Agenci henger sammen: oversikt i dashboard, samtaler i én kø, og oppsett — med ekte skjermbilder fra produktet.",
};

const IMG_SIZES = "(max-width: 1024px) min(96vw, 720px), min(50vw, 560px)";

const visualSections = [
  {
    id: "dashboard-oversikt",
    badge: "Del 1 · Innsikt",
    title: "Oversikt og tall — se hva som skjer",
    lead:
      "Dashboardet samler volum, trender og status på ett sted. Dere ser raskt om kundene får svar i tide, hvor det butter, og hvor dere bør skjerpe innhold eller kapasitet.",
    bullets: [
      "KPI-er og grafer gir felles bilde for ledelse og kundeservice.",
      "Mindre gjetting — mer prioritering ut fra faktisk bruk.",
    ],
    src: "/screenshot1.png",
    alt: "Agenci-dashboard med oversikt og statistikk",
    imageFirst: true,
  },
  {
    id: "samtaler-koer",
    badge: "Del 2 · Drift",
    title: "Samtaler og køer — én arbeidsflate",
    lead:
      "Alle henvendelser samles i samme struktur. Dere kan følge tråder, overta fra AI når det trengs, og sikre at ingen saker stopper i et vakuum mellom kanaler.",
    bullets: [
      "Historikk og kontekst på tvers av samtaler.",
      "Eskalering til menneske uten at kunden må gjenta seg.",
    ],
    src: "/screenshot2.png",
    alt: "Agenci med samtaler, køer og samtaleflyt",
    imageFirst: false,
  },
  {
    id: "oppsett-snarveier",
    badge: "Del 3 · Kontroll",
    title: "Oppsett og snarveier — tilpass uten friksjon",
    lead:
      "Her finner dere snarveier til det som ofte justeres: retningslinjer, integrasjoner og praktiske valg. Målet er at teamet kan finjustere raskt — uten å være avhengig av utvikler for hver lille endring.",
    bullets: [
      "Mer konsistent merkevare og tone i møte med kunden.",
      "Rask vei fra idé til endring i produktet.",
    ],
    src: "/screenshot3.png",
    alt: "Agenci oppsett, snarveier og tilpasning",
    imageFirst: true,
  },
] as const;

const practicalSteps = [
  {
    n: "01",
    icon: Sparkles,
    title: "Installer widget",
    body: "Én embed-kode på nettsiden der dere vil møte kundene. Widgeten kan plasseres diskret eller som tydelig inngang — uten tunge integrasjonsprosjekter.",
  },
  {
    n: "02",
    icon: BookOpen,
    title: "Koble kunnskap",
    body: "Lim inn eller importer FAQ, produkttekster og retningslinjer. AI-en svarer innenfor rammene dere setter, så dere beholder kontroll på budskap og compliance.",
  },
  {
    n: "03",
    icon: LayoutDashboard,
    title: "Styr og forbedre",
    body: "Bruk dashboardet og samtalevisningen til å følge med, justere og lære. Når volumet øker, skalerer dere med data — ikke med kaos.",
  },
] as const;

export default function HvordanDetVirkerPage() {
  return (
    <MarketingPageLayout>
      <article className="border-b border-border/40">
        {/* Hero */}
        <div className="landing-section-mesh">
          <div className="mx-auto max-w-3xl px-4 pb-12 pt-14 text-center md:px-6 md:pb-16 md:pt-20">
            <p className={cn("text-sm", LANDING_MARKETING_EYEBROW_CLASS)}>Slik fungerer det</p>
            <h1 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-foreground md:text-[2.25rem] md:leading-[1.15]">
              Fra widget på nettsiden til full kontroll i dashboardet
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Agenci er bygget som en sammenhengende flyt: kunden møter dere på nettsiden, assistenten
              svarer ut fra deres kunnskap, og teamet styrer kvalitet og volum i samme produkt. Under
              ser du tre kjernedeler — slik de faktisk ser ut i løsningen.
            </p>
            <nav
              aria-label="Hopp til seksjon"
              className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-2 text-sm"
            >
              {visualSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/[0.06] px-3.5 py-1.5 font-medium text-[#0f766e] transition-colors hover:border-[#2DD4BF]/50 hover:bg-[#2DD4BF]/12"
                >
                  {s.badge.split("·")[1]?.trim() ?? s.title}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* Visual sections */}
        <div className="divide-y divide-border/50 bg-gradient-to-b from-background via-muted/15 to-background">
          {visualSections.map((section, index) => (
            <VisualSection key={section.id} section={section} priority={index === 0} />
          ))}
        </div>

        {/* Praktiske steg */}
        <div className="landing-section-mesh border-t border-border/40">
          <div className="mx-auto max-w-5xl px-4 py-16 md:px-6 md:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <p className={cn("text-sm", LANDING_MARKETING_EYEBROW_CLASS)}>I praksis</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                Tre steg — fra tom side til levende assistent
              </h2>
              <p className="mt-4 text-muted-foreground">
                Skjermbildene over viser hvordan det ser ut når dere er i gang. Her er den enkle
                rekkefølgen for å komme dit.
              </p>
            </div>
            <ul className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
              {practicalSteps.map((s) => (
                <li
                  key={s.n}
                  className="relative flex flex-col rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm ring-1 ring-black/[0.03] transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-xs font-bold tabular-nums text-[#2DD4BF]">{s.n}</span>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2DD4BF]/12 text-[#0f766e]">
                      <s.icon className="size-5" strokeWidth={2} aria-hidden />
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{s.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <MarketingSubpageCta />
      </article>
    </MarketingPageLayout>
  );
}

function VisualSection({
  section,
  priority,
}: {
  section: (typeof visualSections)[number];
  priority: boolean;
}) {
  const { id, badge, title, lead, bullets, src, alt, imageFirst } = section;

  const textBlock = (
    <div className="flex flex-col justify-center">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0f766e]">{badge}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight text-foreground md:text-[1.65rem] md:leading-snug">
        {title}
      </h2>
      <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground md:text-base">{lead}</p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-[15px] leading-relaxed text-muted-foreground marker:text-[#2DD4BF]">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );

  const imageBlock = (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/60 bg-[#0a0a0a]/[0.03] shadow-[0_24px_64px_-28px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.06]",
        "dark:bg-black/20",
      )}
    >
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={IMG_SIZES}
          priority={priority}
          className="object-cover object-top [image-rendering:auto]"
        />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/90 via-background/25 to-transparent"
      />
    </div>
  );

  return (
    <section id={id} className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {imageFirst ? (
            <>
              {imageBlock}
              {textBlock}
            </>
          ) : (
            <>
              {textBlock}
              {imageBlock}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
