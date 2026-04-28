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
  { name: "Produkt", href: "/produkt" },
  { name: "Integrasjoner", href: "/integrasjoner" },
  { name: "Slik fungerer det", href: "/hvordan-det-virker" },
  { name: "Kontakt", href: LANDING_CONTACT_PAGE_PATH },
] as const;

/** Footer / «Utforsk» */
export const LANDING_FORSIDE_SECTION_LINKS = [
  { name: "Produkt", href: "/produkt" },
  { name: "Priser", href: hash(LANDING_SECTION_IDS.pricing) },
  { name: "Integrasjoner", href: hash(LANDING_SECTION_IDS.integrations) },
  { name: "Slik det fungerer", href: "/hvordan-det-virker" },
  { name: "Kontakt", href: LANDING_CONTACT_PAGE_PATH },
] as const;

export const LANDING_APP_NAV_LINKS = [
  { name: "Samtaler", href: "/sign-in", loggedInHref: "/conversations" },
  { name: "Widget", href: "/sign-in", loggedInHref: "/customization" },
  { name: "Systemer", href: "/sign-in", loggedInHref: "/integrations" },
] as const;

export const LANDING_DESKTOP_NAV_LINKS = [
  { name: "Priser", href: hash(LANDING_SECTION_IDS.pricing) },
  { name: "FAQ", href: hash(LANDING_SECTION_IDS.faq) },
  { name: "Kontakt", href: LANDING_CONTACT_PAGE_PATH },
] as const;

export const LANDING_FOOTER_PRODUCT_LINKS = [
  { href: "/produkt", label: "Produkt" },
  { href: hash(LANDING_SECTION_IDS.pricing), label: "Priser" },
  { href: hash(LANDING_SECTION_IDS.faq), label: "FAQ" },
  { href: LANDING_CONTACT_PAGE_PATH, label: "Kontakt" },
] as const;

export const LANDING_FOOTER_EXPLORE_LINKS = [
  { href: "/produkt", label: "Produkt" },
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
  appHome: "/conversations",
  /** App-oversikt når innlogget bruker forventes å gå videre inn i produktet (ikke markedsføring). */
  appOverview: "/dashboard",
  /**
   * Innlogget bruker som klikker «Opprett konto» / «Kom i gang» på landing — ikke send til innboks;
   * behold kontekst på markedsføringssider (AuthAwareLink `loggedInHref`).
   */
  marketingLoggedInCta: "/produkt",
} as const;

/** Primær CTA — mint/teal (referansedesign) */
export const LANDING_ACCENT_CTA_BG = "#2DD4BF" as const;

/**
 * Tailwind-klasser for markedsføringssider — matcher landing (ikke shadcn `primary` som ofte er blå).
 * Bruk til «eyebrow»-etiketter over H1 og små aksenter.
 */
export const LANDING_MARKETING_EYEBROW_CLASS =
  "font-medium text-[#0f766e] dark:text-teal-400" as const;

/** H1 på /produkt, /kontakt, /integrasjoner m.fl. — samme rytme som landing */
export const LANDING_MARKETING_H1_CLASS =
  "text-balance text-3xl font-semibold tracking-[-0.035em] text-foreground md:text-4xl md:leading-[1.12]" as const;

/** Ingress under H1 på markedsføringssider */
export const LANDING_MARKETING_LEAD_CLASS =
  "text-pretty text-lg leading-relaxed text-muted-foreground" as const;

/** Tekstlenker i brødtekst (lys/mørk) */
export const LANDING_MARKETING_INLINE_LINK_CLASS =
  "font-medium text-[#0f766e] underline-offset-4 transition-colors hover:text-[#0d9488] hover:underline dark:text-teal-400 dark:hover:text-teal-300" as const;

/** Feature-kort (produkt m.fl.) — teal hover, matcher landing-seksjoner */
export const LANDING_MARKETING_FEATURE_CARD_CLASS =
  "group rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow] duration-200 hover:border-[#2DD4BF]/35 hover:shadow-[0_12px_40px_-24px_rgba(45,212,191,0.18)] dark:bg-card/40" as const;

/** Skjemaramme på lys markedsføringsbakgrunn */
export const LANDING_MARKETING_FORM_PANEL_CLASS =
  "rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur-md md:p-8 dark:bg-card/30" as const;

/**
 * Primær CTA — bakgrunn, tekst og hover (uten radius/skygge).
 * Bruk på hero (pill), nav, footer, prising m.m. sammen med egne `rounded-*` og `shadow-*`.
 */
export const LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS =
  "bg-[#2DD4BF] font-semibold text-neutral-950 hover:bg-[#2DD4BF]/90" as const;

/** Standard skygge for primær CTA på lys flate (markedsføringssider, skjema) */
export const LANDING_MARKETING_PRIMARY_CTA_SHADOW_CLASS =
  "shadow-[0_14px_36px_-14px_rgba(45,212,191,0.35)]" as const;

/** Primær knapp (markedsføring) — avrundet 2xl + standard skygge */
export const LANDING_MARKETING_PRIMARY_CTA_CLASS =
  `rounded-2xl ${LANDING_MARKETING_PRIMARY_CTA_SURFACE_CLASS} ${LANDING_MARKETING_PRIMARY_CTA_SHADOW_CLASS}` as const;

/** Sekundær outline (markedsføring) */
export const LANDING_MARKETING_OUTLINE_CTA_CLASS =
  "rounded-2xl border-[#2DD4BF]/45 bg-background/90 text-foreground hover:bg-[#2DD4BF]/10 dark:bg-background/40" as const;

/** Ikonflate i feature-kort */
export const LANDING_MARKETING_ICON_TILE_CLASS =
  "flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#2DD4BF]/12 text-[#0f766e] dark:text-teal-400" as const;

/** Nav-piller (f.eks. hopp til seksjon) */
export const LANDING_MARKETING_PILL_CLASS =
  "rounded-full border border-[#2DD4BF]/30 bg-[#2DD4BF]/[0.06] px-3.5 py-1.5 font-medium text-[#0f766e] transition-colors hover:border-[#2DD4BF]/50 hover:bg-[#2DD4BF]/12 dark:text-teal-400 dark:hover:text-teal-300" as const;

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
  "Agenci er en chat på nettsiden deres som svarer ut fra deres egne tekster og dokumenter — og sender kunden videre til et menneske når saken krever det. Alt styres fra samme dashboard." as const;
