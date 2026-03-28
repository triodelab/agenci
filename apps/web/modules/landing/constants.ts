/**
 * Landing — én sannhetskilde for navigasjon, anker og lenker.
 * Seksjons-ID-er brukes når innhold bygges på forsiden (`/#pricing` osv.).
 */

export const LANDING_SECTION_IDS = {
  /**
   * Hvit «Hvorfor Agenci» / produkt-seksjon under hero.
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

const hash = (id: string) => `/#${id}`;

/** Lenke til anker på forsiden (typed keys) */
export function landingSectionHref(key: keyof typeof LANDING_SECTION_IDS): string {
  return hash(LANDING_SECTION_IDS[key]);
}

/** Hovedmeny (sentrert i header) — matcher ny landing-struktur */
export const LANDING_NAV_PRIMARY_LINKS = [
  { name: "Hjem", href: "/" },
  { name: "Hvorfor Agenci", href: hash(LANDING_SECTION_IDS.workflow) },
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
} as const;

/** Primær CTA — mint/teal (referansedesign) */
export const LANDING_ACCENT_CTA_BG = "#2DD4BF" as const;

/**
 * Tailwind-klasser for markedsføringssider — matcher landing (ikke shadcn `primary` som ofte er blå).
 * Bruk til «eyebrow»-etiketter over H1 og små aksenter.
 */
export const LANDING_MARKETING_EYEBROW_CLASS =
  "font-medium text-[#0f766e] dark:text-teal-400" as const;

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
  "Koble widget, kunnskap og mennesker i én flate — mindre friksjon for kundene og mer flyt for teamet." as const;
