/**
 * Delte konstanter for landing (samme idé som `modules/dashboard/constants.ts`):
 * én sannhetskilde for seksjons-ankre og navigasjon på forsiden.
 */

export const LANDING_SECTION_IDS = {
  /** Én samlet produktblokk (kort landing) */
  product: "product",
  /** Bakoverkompatibel med gamle #features-lenker */
  features: "product",
  integrations: "integrations",
  pricing: "pricing",
  trust: "trust",
  faq: "faq",
  contact: "contact",
  howItWorks: "how-it-works",
  useCases: "use-cases",
} as const;

const hash = (id: string) => `/#${id}`;

/** Egne markedsføringssider (offentlige, ikke innlogging) */
export const LANDING_MARKETING_PAGE_LINKS = [
  { name: "Produkt", href: "/produkt" },
  { name: "Integrasjoner", href: "/integrasjoner" },
  { name: "Slik fungerer det", href: "/hvordan-det-virker" },
] as const;

/** Seksjoner på forsiden (for «Forside»-meny) */
export const LANDING_FORSIDE_SECTION_LINKS = [
  { name: "Produkt (oversikt)", href: hash(LANDING_SECTION_IDS.product) },
  { name: "Slik det fungerer", href: hash(LANDING_SECTION_IDS.howItWorks) },
  { name: "Brukstilfeller", href: hash(LANDING_SECTION_IDS.useCases) },
  { name: "Integrasjoner", href: hash(LANDING_SECTION_IDS.integrations) },
  { name: "Tillit", href: hash(LANDING_SECTION_IDS.trust) },
] as const;

/** Dashboard-ruter — AuthAwareLink: innlogget → app, ellers → innlogging */
export const LANDING_APP_NAV_LINKS = [
  { name: "Samtaler", href: "/sign-in", loggedInHref: "/conversations" },
  { name: "Widget", href: "/sign-in", loggedInHref: "/customization" },
  { name: "Systemer", href: "/sign-in", loggedInHref: "/integrations" },
] as const;

export const LANDING_DESKTOP_NAV_LINKS = [
  { name: "Priser", href: hash(LANDING_SECTION_IDS.pricing) },
  { name: "FAQ", href: hash(LANDING_SECTION_IDS.faq) },
  { name: "Kontakt", href: hash(LANDING_SECTION_IDS.contact) },
] as const;

/** Footer — korte, relevante lenker */
export const LANDING_FOOTER_PRODUCT_LINKS = [
  { href: hash(LANDING_SECTION_IDS.product), label: "Oversikt (forside)" },
  { href: hash(LANDING_SECTION_IDS.pricing), label: "Priser" },
  { href: hash(LANDING_SECTION_IDS.faq), label: "FAQ" },
  { href: hash(LANDING_SECTION_IDS.contact), label: "Kontakt" },
] as const;

export const LANDING_FOOTER_EXPLORE_LINKS = [
  { href: "/produkt", label: "Produkt" },
  { href: "/integrasjoner", label: "Integrasjoner" },
  { href: "/hvordan-det-virker", label: "Slik fungerer det" },
] as const;

export const LANDING_FOOTER_NAV_GROUPS = [
  { name: "Forside" as const, links: LANDING_FOOTER_PRODUCT_LINKS },
  { name: "Sider" as const, links: LANDING_FOOTER_EXPLORE_LINKS },
] as const;

export const LANDING_AUTH_PATHS = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  /** Etter innlogging — samme inngang som dashboard i denne appen. */
  appHome: "/conversations",
} as const;
