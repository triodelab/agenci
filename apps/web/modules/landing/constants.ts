/**
 * Landing — én sannhetskilde for navigasjon, anker og lenker.
 * Seksjons-ID-er brukes når innhold bygges på forsiden.
 *
 * **Viktig:** `middleware.ts` omdirigerer innloggede brukere med org fra `/` til `/dashboard`,
 * unntatt `/?from=marketing` (se «Til forsiden» i dashboard). Alle lenker til forsiden med anker
 * må derfor bruke `/?from=marketing#…`, ellers ender brukeren på dashboard.
 */

export const LANDING_SECTION_IDS = {
  /**
   * Hvit «Hva Agenci er» / produkt-seksjon under hero.
   * Én DOM-anker: `product` (tidligere `workflow` — gamle `/#workflow`-bokmerker bør oppdateres).
   */
  workflow: "product",
  product: "product",
  features: "product",
  dashboardScroll: "dashboard-scroll",
  aiTraining: "ai-training",
  securityBehavior: "security-behavior",
  finalCta: "final-cta",
  integrations: "integrations",
  pricing: "pricing",
  trust: "trust",
  faq: "faq",
  contact: "contact",
  /** Samme synlige seksjon som workflow/produkt på forsiden */
  howItWorks: "product",
  useCases: "use-cases",
} as const;

/** Egen side med kontaktskjema — forsiden har også skjema under `#contact` */
export const LANDING_CONTACT_PAGE_PATH = "/kontakt" as const;

/** Forside med anker — alltid med `from=marketing` så middleware ikke sender til dashboard */
const hash = (id: string) => `/?from=marketing#${id}`;

/** Bare forsiden (uten anker), for «Hjem» i nav */
export const LANDING_HOME_MARKETING_HREF = "/?from=marketing" as const;

/** Lenke til anker på forsiden (typed keys) */
export function landingSectionHref(key: keyof typeof LANDING_SECTION_IDS): string {
  return hash(LANDING_SECTION_IDS[key]);
}

/** Hovedmeny (sentrert i header) — matcher ny landing-struktur */
export const LANDING_NAV_PRIMARY_LINKS = [
  { name: "Hjem", href: LANDING_HOME_MARKETING_HREF },
  { name: "Produktet", href: hash(LANDING_SECTION_IDS.workflow) },
  { name: "Priser", href: hash(LANDING_SECTION_IDS.pricing) },
  { name: "Slik det fungerer", href: "/hvordan-det-virker" },
  { name: "Kontakt", href: LANDING_CONTACT_PAGE_PATH },
] as const;

/** Egne markedsføringssider */
export const LANDING_MARKETING_PAGE_LINKS = [
  { name: "Integrasjoner", href: "/integrasjoner" },
  { name: "Slik fungerer det", href: "/hvordan-det-virker" },
  { name: "Kontakt", href: LANDING_CONTACT_PAGE_PATH },
] as const;

/** Footer / «Utforsk» */
export const LANDING_FORSIDE_SECTION_LINKS = [
  { name: "Priser", href: hash(LANDING_SECTION_IDS.pricing) },
  { name: "Integrasjoner", href: hash(LANDING_SECTION_IDS.integrations) },
  { name: "Slik det fungerer", href: "/hvordan-det-virker" },
  { name: "Kontakt", href: LANDING_CONTACT_PAGE_PATH },
] as const;

export const LANDING_APP_NAV_LINKS = [
  { name: "Agenter", href: "/sign-in", loggedInHref: "/agents" },
  { name: "Widget", href: "/sign-in", loggedInHref: "/customization" },
  { name: "Systemer", href: "/sign-in", loggedInHref: "/integrations" },
] as const;

export const LANDING_DESKTOP_NAV_LINKS = [
  { name: "Priser", href: hash(LANDING_SECTION_IDS.pricing) },
  { name: "FAQ", href: hash(LANDING_SECTION_IDS.faq) },
  { name: "Kontakt", href: LANDING_CONTACT_PAGE_PATH },
] as const;

export const LANDING_FOOTER_PRODUCT_LINKS = [
  { href: hash(LANDING_SECTION_IDS.pricing), label: "Priser" },
  { href: hash(LANDING_SECTION_IDS.faq), label: "FAQ" },
  { href: LANDING_CONTACT_PAGE_PATH, label: "Kontakt" },
] as const;

export const LANDING_FOOTER_EXPLORE_LINKS = [
  { href: "/integrasjoner", label: "Integrasjoner" },
  { href: "/hvordan-det-virker", label: "Slik fungerer det" },
] as const;

/** Juridikk — footer + sitemap */
export const LANDING_LEGAL_LINKS = [
  { href: "/personvern", label: "Personvern" },
  { href: "/vilkar", label: "Vilkår" },
] as const;

export const LANDING_FOOTER_NAV_GROUPS = [
  { name: "Forside" as const, links: LANDING_FOOTER_PRODUCT_LINKS },
  { name: "Sider" as const, links: LANDING_FOOTER_EXPLORE_LINKS },
] as const;

export const LANDING_AUTH_PATHS = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  appHome: "/agents",
  /** App-oversikt når innlogget bruker forventes å gå videre inn i produktet (ikke markedsføring). */
  appOverview: "/dashboard",
  /**
   * Innlogget bruker som klikker «Opprett konto» / «Kom i gang» på landing — ikke send til innboks;
   * behold kontekst på markedsføringssider (AuthAwareLink `loggedInHref`).
   */
  marketingLoggedInCta: "/agents",
} as const;

/** Primær CTA — hvit på mørk bakgrunn */
export const LANDING_ACCENT_CTA_BG = "#FFFFFF" as const;

/**
 * Tailwind-klasser for markedsføringssider — nøytral DOSS-palett.
 * Bruk til «eyebrow»-etiketter over H1 og små aksenter.
 */
export const LANDING_MARKETING_EYEBROW_CLASS =
  "font-medium text-[#6b7280]" as const;

/** H1 på /produkt, /kontakt, /integrasjoner m.fl. — samme rytme som landing */
export const LANDING_MARKETING_H1_CLASS =
  "text-balance text-3xl font-semibold tracking-[-0.035em] text-[#f2f3f5] md:text-4xl md:leading-[1.12]" as const;

/** Ingress under H1 på markedsføringssider */
export const LANDING_MARKETING_LEAD_CLASS =
  "text-pretty text-lg leading-relaxed text-[#9ca3af]" as const;

/** Tekstlenker i brødtekst */
export const LANDING_MARKETING_INLINE_LINK_CLASS =
  "font-medium text-[#9ca3af] underline-offset-4 transition-colors hover:text-[#f2f3f5] hover:underline" as const;

/** Feature-kort (produkt m.fl.) — nøytral hover */
export const LANDING_MARKETING_FEATURE_CARD_CLASS =
  "group rounded-2xl border border-[#2a2a2a] bg-[#161616] p-6 transition-[border-color] duration-200 hover:border-[#3a3a3a]" as const;

/** Skjemaramme på mørk markedsføringsbakgrunn */
export const LANDING_MARKETING_FORM_PANEL_CLASS =
  "rounded-2xl border border-[#2a2a2a] bg-[#161616] p-6 md:p-8" as const;

/**
 * Primær CTA — bakgrunn, tekst og hover (uten radius/skygge).
 * Bruk på hero (pill), nav, footer, prising m.m.
 */
export const LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS =
  "bg-white font-semibold text-[#1C1C1C] hover:bg-[#f2f3f5]" as const;

/** Standard skygge for primær CTA */
export const LANDING_MARKETING_PRIMARY_CTA_SHADOW_CLASS =
  "shadow-[0_14px_36px_-14px_rgba(255,255,255,0.15)]" as const;

/** Primær knapp (markedsføring) — avrundet 2xl + standard skygge */
export const LANDING_MARKETING_PRIMARY_CTA_CLASS =
  `rounded-2xl ${LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS} ${LANDING_MARKETING_PRIMARY_CTA_SHADOW_CLASS}` as const;

/** Sekundær outline (markedsføring) */
export const LANDING_MARKETING_OUTLINE_CTA_CLASS =
  "rounded-2xl border-[#2a2a2a] bg-transparent text-[#9ca3af] hover:border-[#3a3a3a] hover:text-[#f2f3f5]" as const;

/** Ikonflate i feature-kort */
export const LANDING_MARKETING_ICON_TILE_CLASS =
  "flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.08] text-[#9ca3af]" as const;

/** Nav-piller (f.eks. hopp til seksjon) */
export const LANDING_MARKETING_PILL_CLASS =
  "rounded-full border border-[#2a2a2a] bg-[#161616] px-3.5 py-1.5 font-medium text-[#6b7280] transition-colors hover:border-[#3a3a3a] hover:text-[#f2f3f5]" as const;

/**
 * Første hvite blokk under dashboard i hero — brukes av `LandingNav variant="auto"`
 * til å bytte lys/mørk nav-tone ved scroll (lys seksjon vs. mørk hero/footer).
 */
export const LANDING_NAV_TONE_BOUNDARY_ID = "landing-nav-tone-boundary" as const;

/**
 * Settes på hele seksjoner (`data-landing-nav-surface="dark" | "light"`).
 * `LandingNav variant="auto"` bruker punkt i nav-båndet + hero-boundary som fallback.
 */
export const LANDING_NAV_SURFACE_ATTR = "data-landing-nav-surface" as const;

/** Undertekst rett under hero-podium (hvit sone) */
export const LANDING_HERO_WORKFLOW_LEAD =
  "Du svarer sannsynligvis de samme spørsmålene hver eneste dag. Åpningstider, priser, leveringstid, returpolicy. Agenci gjør det for deg — på nettsiden, hele døgnet — med svarene du selv har skrevet." as const;
