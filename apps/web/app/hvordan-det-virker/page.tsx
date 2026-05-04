import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { AuthAwareLink } from "@/components/auth-aware-link";
import { MarketingPageLayout } from "@/modules/landing/ui/components/marketing-page-layout";
import { Button } from "@workspace/ui/components/button";
import {
  LANDING_AUTH_PATHS,
  LANDING_CONTACT_PAGE_PATH,
} from "@/modules/landing/constants";
import { BookOpen, LayoutDashboard, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Slik fungerer det",
  description:
    "Fra chat på nettsiden til dashboard: se hvordan Agenci samler innsikt, samtaler og oppsett — med skjermbilder fra produktet.",
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
      {/* ── Hero ── */}
      <section className="bg-[#010102]">
        <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-20 text-center md:pb-24 md:pt-24 xl:px-8">
          <p className="text-[13px] font-medium uppercase tracking-[0.4px] text-[#8a8f98]">
            Slik fungerer det
          </p>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance text-[40px] font-semibold leading-[1.15] tracking-[-1.8px] text-[#f7f8f8] md:text-[56px] md:leading-[1.10]">
            Fra widget på nettsiden til full kontroll i dashboardet
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-[1.5] tracking-[-0.1px] text-[#d0d6e0]">
            Agenci er bygget som en sammenhengende flyt: kunden møter dere på nettsiden, assistenten
            svarer ut fra deres kunnskap, og teamet styrer kvalitet og volum i samme produkt.
          </p>
          <nav
            aria-label="Hopp til seksjon"
            className="mt-10 flex flex-wrap items-center justify-center gap-2"
          >
            {visualSections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="rounded-full border border-[#23252a] bg-[#0f1011] px-4 py-1.5 text-[13px] font-medium text-[#8a8f98] transition-colors hover:border-[#34343a] hover:text-[#f7f8f8]"
              >
                {s.badge.split("·")[1]?.trim() ?? s.title}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* ── Visual sections ── */}
      {visualSections.map((section, index) => (
        <VisualSection key={section.id} section={section} priority={index === 0} />
      ))}

      {/* ── Praktiske steg ── */}
      <section className="border-t border-[#23252a] bg-[#0f1011]">
        <div className="mx-auto max-w-[1200px] px-6 py-24 xl:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[13px] font-medium uppercase tracking-[0.4px] text-[#8a8f98]">
              I praksis
            </p>
            <h2 className="mt-5 text-balance text-[40px] font-semibold leading-[1.15] tracking-[-1px] text-[#f7f8f8]">
              Tre steg — fra tom side til levende assistent
            </h2>
            <p className="mt-5 text-[16px] leading-[1.5] tracking-[-0.05px] text-[#d0d6e0]">
              Skjermbildene over viser hvordan det ser ut når dere er i gang. Her er den enkle
              rekkefølgen for å komme dit.
            </p>
          </div>

          <ul className="mt-16 grid gap-5 md:grid-cols-3">
            {practicalSteps.map((s) => (
              <li
                key={s.n}
                className="flex flex-col rounded-[12px] border border-[#23252a] bg-[#141516] p-6"
              >
                <span className="text-[13px] font-medium tabular-nums text-[#5e6ad2]">
                  {s.n}
                </span>
                <div className="mt-5 flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#5e6ad2]/10 text-[#5e6ad2]">
                  <s.icon className="size-5" strokeWidth={1.75} aria-hidden />
                </div>
                <h3 className="mt-5 text-[22px] font-medium leading-[1.25] tracking-[-0.4px] text-[#f7f8f8]">
                  {s.title}
                </h3>
                <p className="mt-3 flex-1 text-[14px] leading-[1.5] text-[#d0d6e0]">{s.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="border-t border-[#23252a] bg-[#010102]">
        <div className="mx-auto max-w-[1200px] px-6 py-24 xl:px-8">
          <div className="rounded-[12px] border border-[#23252a] bg-[#0f1011] px-8 py-10 md:px-12 md:py-12">
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[13px] font-medium uppercase tracking-[0.4px] text-[#8a8f98]">
                  Neste steg
                </p>
                <h2 className="mt-4 max-w-md text-[28px] font-semibold leading-[1.20] tracking-[-0.6px] text-[#f7f8f8]">
                  Vil dere se Agenci på deres egen nettside?
                </h2>
                <p className="mt-3 max-w-md text-[16px] leading-[1.5] tracking-[-0.05px] text-[#d0d6e0]">
                  Opprett konto for å teste widget og dashboard, eller send oss en melding — vi hjelper
                  med oppsett og nivå som passer volumet deres.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <Button
                  className="h-9 rounded-[8px] bg-[#5e6ad2] px-3.5 text-[14px] font-medium text-white transition-colors hover:bg-[#828fff]"
                  asChild
                >
                  <AuthAwareLink
                    href={LANDING_AUTH_PATHS.signUp}
                    loggedInHref={LANDING_AUTH_PATHS.marketingLoggedInCta}
                  >
                    Kom i gang
                  </AuthAwareLink>
                </Button>
                <Button
                  className="h-9 rounded-[8px] border border-[#34343a] bg-transparent px-3.5 text-[14px] font-medium text-[#d0d6e0] transition-colors hover:border-[#5e6ad2]/50 hover:bg-[#5e6ad2]/5 hover:text-[#f7f8f8]"
                  asChild
                >
                  <Link href={LANDING_CONTACT_PAGE_PATH}>Kontaktskjema</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
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
      <p className="text-[13px] font-medium uppercase tracking-[0.4px] text-[#8a8f98]">{badge}</p>
      <h2 className="mt-5 text-[32px] font-semibold leading-[1.15] tracking-[-1px] text-[#f7f8f8] md:text-[40px]">
        {title}
      </h2>
      <p className="mt-5 text-[16px] leading-[1.5] tracking-[-0.05px] text-[#d0d6e0]">{lead}</p>
      <ul className="mt-6 space-y-3">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-3 text-[14px] leading-[1.5] text-[#d0d6e0]">
            <span
              aria-hidden
              className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#5e6ad2]"
            />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );

  const imageBlock = (
    <div className="overflow-hidden rounded-[16px] border border-[#23252a] bg-[#0f1011]">
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={IMG_SIZES}
          priority={priority}
          className="object-cover object-top"
        />
      </div>
    </div>
  );

  return (
    <section id={id} className="scroll-mt-20 border-t border-[#23252a] bg-[#010102]">
      <div className="mx-auto max-w-[1200px] px-6 py-20 md:py-24 xl:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
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
