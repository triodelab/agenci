"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, Shield } from "lucide-react";
import { useCookieConsent, ConsentState } from "@/hooks/use-cookie-consent";
import { cn } from "@workspace/ui/lib/utils";

/* ─── Cookie definitions ──────────────────────────────────────────── */

type CookieDef = {
  name: string;
  provider: string;
  purpose: string;
  type: string;
  duration: string;
};

type Category = {
  key: keyof Omit<ConsentState, "necessary">;
  label: string;
  alwaysOn?: boolean;
  description: string;
  cookies: CookieDef[];
};

const CATEGORIES: Category[] = [
  {
    key: "necessary" as unknown as keyof Omit<ConsentState, "necessary">,
    label: "Strengt nødvendige",
    alwaysOn: true,
    description:
      "Disse informasjonskapslene er nødvendige for at nettsiden skal fungere og kan ikke deaktiveres. De settes vanligvis kun som svar på handlinger du gjør, f.eks. innlogging, lagring av preferanser eller utfylling av skjemaer.",
    cookies: [
      {
        name: "__session",
        provider: "Clerk (clerk.com)",
        purpose: "Holder deg innlogget. Inneholder kryptert sesjonstoken.",
        type: "HTTP-cookie",
        duration: "Økt",
      },
      {
        name: "__client_uat",
        provider: "Clerk (clerk.com)",
        purpose: "Brukes av Clerk for å verifisere at klientsesjonen er gyldig og oppdatert.",
        type: "HTTP-cookie",
        duration: "1 år",
      },
      {
        name: "agenci_cookie_consent",
        provider: "Agenci",
        purpose: "Lagrer ditt samtykkevalg slik at cookie-banneren ikke vises igjen.",
        type: "localStorage",
        duration: "12 måneder",
      },
      {
        name: "sidebar_state",
        provider: "Agenci (dashboard)",
        purpose: "Husker om sidemenyen er åpen eller lukket. Settes kun for innloggede brukere i dashboardet.",
        type: "HTTP-cookie",
        duration: "Økt",
      },
      {
        name: "echo_contact_session_{orgId}",
        provider: "Agenci (widget)",
        purpose: "Lagrer chat-sesjons-ID i nettleserens localStorage slik at det gjenkjennes mellom sidevisninger.",
        type: "localStorage",
        duration: "24 timer",
      },
      {
        name: "echo_conversation_{orgId}",
        provider: "Agenci (widget)",
        purpose: "Lagrer aktiv samtale-ID slik at widgeten ikke oppretter ny samtale ved hver sideinnlasting.",
        type: "localStorage",
        duration: "24 timer",
      },
    ],
  },
  {
    key: "statistics",
    label: "Statistikk",
    description:
      "Disse informasjonskapslene hjelper oss å forstå hvordan besøkende bruker nettsiden ved å samle inn og rapportere informasjon anonymt. Vi bruker dette til å feilsøke problemer og forbedre tjenestens pålitelighet.",
    cookies: [
      {
        name: "Sentry SDK",
        provider: "Sentry / Functional Software Inc.",
        purpose: "Registrerer tekniske feil og ytelsesdata for å feilsøke og forbedre tjenesten. Ingen sesjonsopptak er aktivert. Data lagres i Sentrys EU-region (Frankfurt).",
        type: "Nettverksforespørsel / localStorage",
        duration: "Økt",
      },
    ],
  },
  {
    key: "preferences",
    label: "Preferanser",
    description:
      "Disse informasjonskapslene gjør det mulig for nettsiden å huske valg du har tatt og tilby forbedret funksjonalitet.",
    cookies: [],
  },
  {
    key: "marketing",
    label: "Markedsføring",
    description:
      "Disse informasjonskapslene brukes til å spore besøkende på tvers av nettsteder for å vise relevante annonser. Akkurat nå bruker vi ingen markedsføringscookies.",
    cookies: [],
  },
];

/* ─── Toggle switch ───────────────────────────────────────────────── */

function Toggle({
  checked,
  disabled,
  onChange,
  id,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
  id: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#161616]",
        checked ? "bg-white" : "bg-[#2a2a2a]",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full shadow-sm transition-transform duration-200",
          checked ? "translate-x-4 bg-[#1C1C1C]" : "translate-x-0 bg-[#6b7280]",
        )}
      />
    </button>
  );
}

/* ─── Accordion category row ─────────────────────────────────────── */

function CategoryRow({
  cat,
  enabled,
  onToggle,
}: {
  cat: Category;
  enabled: boolean;
  onToggle: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const isNecessary = cat.alwaysOn;

  return (
    <div className="border-b border-[#2a2a2a] last:border-b-0">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex flex-1 items-center gap-2 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded"
          aria-expanded={open}
        >
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-[#4b5563] transition-transform duration-200",
              open && "rotate-180",
            )}
            strokeWidth={1.75}
          />
          <span className="text-[14px] font-medium text-[#f2f3f5]">{cat.label}</span>
          {isNecessary && (
            <span className="rounded-full bg-white/[0.08] px-2 py-0.5 text-[11px] font-medium text-[#9ca3af]">
              Alltid på
            </span>
          )}
          {cat.cookies.length === 0 && !isNecessary && (
            <span className="rounded-full bg-[#2a2a2a] px-2 py-0.5 text-[11px] text-[#4b5563]">
              Ingen
            </span>
          )}
        </button>
        <Toggle
          id={`toggle-${cat.key}`}
          checked={isNecessary ? true : enabled}
          disabled={isNecessary}
          onChange={isNecessary ? undefined : onToggle}
        />
      </div>

      {/* Expanded content */}
      {open && (
        <div className="pb-4 pl-6">
          <p className="text-[13px] leading-[1.65] text-[#6b7280]">{cat.description}</p>

          {cat.cookies.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-[8px] border border-[#2a2a2a]">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-[#2a2a2a] bg-[#111111]">
                    <th className="px-3 py-2 text-left font-medium text-[#4b5563]">Navn</th>
                    <th className="hidden px-3 py-2 text-left font-medium text-[#4b5563] sm:table-cell">Leverandør</th>
                    <th className="hidden px-3 py-2 text-left font-medium text-[#4b5563] md:table-cell">Formål</th>
                    <th className="px-3 py-2 text-left font-medium text-[#4b5563]">Varighet</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.cookies.map((c) => (
                    <tr key={c.name} className="border-b border-[#2a2a2a] last:border-b-0">
                      <td className="px-3 py-2.5 font-mono text-[11px] text-[#9ca3af]">{c.name}</td>
                      <td className="hidden px-3 py-2.5 text-[#6b7280] sm:table-cell">{c.provider}</td>
                      <td className="hidden px-3 py-2.5 text-[#6b7280] md:table-cell">{c.purpose}</td>
                      <td className="px-3 py-2.5 text-[#6b7280]">{c.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {cat.cookies.length === 0 && (
            <p className="mt-3 text-[13px] italic text-[#4b5563]">
              Ingen informasjonskapsler i denne kategorien for øyeblikket.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main banner/dialog ─────────────────────────────────────────── */

export function CookieConsentBanner() {
  const { hasConsented, mounted, save, acceptAll, acceptNecessary } = useCookieConsent();
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selections, setSelections] = useState({
    statistics: false,
    marketing: false,
    preferences: true,
  });

  useEffect(() => {
    if (mounted && !hasConsented) {
      const id = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(id);
    }
  }, [mounted, hasConsented]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === null) {
        setShowDetails(false);
        setVisible(true);
      }
    };
    window.addEventListener("agenci-consent-updated", handler);
    return () => window.removeEventListener("agenci-consent-updated", handler);
  }, []);

  if (!mounted || hasConsented) return null;
  if (!visible) return null;

  const handleSave = () => {
    save(selections);
    setVisible(false);
  };

  const handleAcceptAll = () => {
    acceptAll();
    setVisible(false);
  };

  const handleNecessary = () => {
    acceptNecessary();
    setVisible(false);
  };

  const toggle = (key: keyof typeof selections, val: boolean) => {
    setSelections((s) => ({ ...s, [key]: val }));
  };

  /* ── Details dialog ── */
  if (showDetails) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center"
        role="dialog"
        aria-modal="true"
        aria-label="Cookie-innstillinger"
      >
        <div className="flex max-h-[90dvh] w-full max-w-[640px] flex-col rounded-[16px] border border-[#2a2a2a] bg-[#161616] shadow-[0_24px_64px_rgba(0,0,0,0.7)]">
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-[#2a2a2a] px-6 py-5">
            <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white/[0.08]">
              <Shield className="size-4 text-[#9ca3af]" strokeWidth={1.75} />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-[#f2f3f5]">Cookie-innstillinger</h2>
              <p className="text-[12px] text-[#4b5563]">Agenci — Hassan Triodelab DA</p>
            </div>
          </div>

          {/* Intro */}
          <div className="border-b border-[#2a2a2a] px-6 py-4">
            <p className="text-[13px] leading-[1.65] text-[#6b7280]">
              Vi bruker informasjonskapsler og lignende teknologi for å sikre at nettsiden fungerer,
              analysere trafikk og forbedre tjenesten. Du kan velge hvilke kategorier du godtar.{" "}
              <Link href="/personvern#cookies" className="text-[#9ca3af] underline underline-offset-2 hover:text-[#f2f3f5] transition-colors">
                Les mer i vår personvernerklæring
              </Link>
              .
            </p>
          </div>

          {/* Category list */}
          <div className="flex-1 overflow-y-auto px-6">
            {CATEGORIES.map((cat) => (
              <CategoryRow
                key={cat.key as string}
                cat={cat}
                enabled={
                  cat.alwaysOn ? true : selections[cat.key as keyof typeof selections] ?? false
                }
                onToggle={(v) =>
                  !cat.alwaysOn && toggle(cat.key as keyof typeof selections, v)
                }
              />
            ))}
          </div>

          {/* Footer actions */}
          <div className="flex flex-col-reverse gap-2 border-t border-[#2a2a2a] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={handleNecessary}
              className="rounded-[8px] border border-[#2a2a2a] px-4 py-2 text-[13px] font-medium text-[#6b7280] transition-colors hover:border-[#3a3a3a] hover:text-[#f2f3f5]"
            >
              Kun nødvendige
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 rounded-[8px] border border-[#2a2a2a] px-4 py-2 text-[13px] font-medium text-[#9ca3af] transition-colors hover:border-[#3a3a3a] hover:text-[#f2f3f5] sm:flex-none"
              >
                Lagre mitt valg
              </button>
              <button
                type="button"
                onClick={handleAcceptAll}
                className="flex-1 rounded-[8px] bg-white px-4 py-2 text-[13px] font-medium text-[#1C1C1C] transition-colors hover:bg-[#f2f3f5] sm:flex-none"
              >
                Godta alle
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Initial banner strip ── */
  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie-samtykke"
      className="fixed bottom-0 inset-x-0 z-[9999] px-4 pb-4 sm:px-6 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
    >
      <div className="mx-auto max-w-[960px] rounded-[12px] border border-[#2a2a2a] bg-[#161616] p-5 shadow-[0_-4px_32px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
          {/* Text */}
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-[#f2f3f5]">
              Vi bruker informasjonskapsler
            </p>
            <p className="mt-1 text-[13px] leading-[1.65] text-[#6b7280]">
              Vi bruker nødvendige cookies for å drifte nettsiden og Sentry for teknisk feilsporing.
              Du kan godta alle kategorier, velge kun nødvendige, eller tilpasse valget ditt.{" "}
              <Link
                href="/personvern#cookies"
                className="text-[#9ca3af] underline-offset-2 hover:underline transition-colors"
                target="_blank"
              >
                Personvernerklæring
              </Link>
            </p>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDetails(true)}
              className="h-9 rounded-[8px] border border-[#2a2a2a] px-3.5 text-[13px] font-medium text-[#6b7280] transition-colors hover:border-[#3a3a3a] hover:text-[#f2f3f5]"
            >
              Innstillinger
            </button>
            <button
              type="button"
              onClick={handleNecessary}
              className="h-9 rounded-[8px] border border-[#2a2a2a] px-3.5 text-[13px] font-medium text-[#9ca3af] transition-colors hover:text-[#f2f3f5]"
            >
              Kun nødvendige
            </button>
            <button
              type="button"
              onClick={handleAcceptAll}
              className="h-9 rounded-[8px] bg-white px-3.5 text-[13px] font-medium text-[#1C1C1C] transition-colors hover:bg-[#f2f3f5]"
            >
              Godta alle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
