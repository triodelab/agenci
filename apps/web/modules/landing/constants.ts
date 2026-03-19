/**
 * Delte konstanter for landing (samme idé som `modules/dashboard/constants.ts`):
 * én sannhetskilde for seksjons-ankre og navigasjon på forsiden.
 */

export const LANDING_SECTION_IDS = {
  features: "features",
  integrations: "integrations",
  pricing: "pricing",
  trust: "trust",
  faq: "faq",
  contact: "contact",
  useCases: "use-cases",
  howItWorks: "how-it-works",
} as const;

const hash = (id: string) => `/#${id}`;

/** Toppmeny: undermeny «Funksjoner» (ankre inntil egne /features-sider finnes). */
export const LANDING_FEATURE_NAV_LINKS = [
  { name: "Alle funksjoner", href: hash(LANDING_SECTION_IDS.features) },
  { name: "Widget", href: hash(LANDING_SECTION_IDS.features) },
  { name: "Voice (Premium)", href: hash(LANDING_SECTION_IDS.pricing) },
  { name: "Integrasjoner", href: hash(LANDING_SECTION_IDS.integrations) },
  { name: "Sikkerhet", href: hash(LANDING_SECTION_IDS.trust) },
] as const;

export const LANDING_DESKTOP_NAV_LINKS = [
  { name: "Priser", href: hash(LANDING_SECTION_IDS.pricing) },
  { name: "FAQ", href: hash(LANDING_SECTION_IDS.faq) },
  { name: "Kontakt", href: hash(LANDING_SECTION_IDS.contact) },
] as const;

/** Footer: én kolonne «Produkt». */
export const LANDING_FOOTER_PRODUCT_LINKS = [
  { href: hash(LANDING_SECTION_IDS.features), label: "Funksjoner" },
  { href: hash(LANDING_SECTION_IDS.integrations), label: "Integrasjoner" },
  { href: hash(LANDING_SECTION_IDS.pricing), label: "Priser" },
  { href: hash(LANDING_SECTION_IDS.trust), label: "Sikkerhet" },
  { href: hash(LANDING_SECTION_IDS.faq), label: "FAQ" },
  { href: hash(LANDING_SECTION_IDS.contact), label: "Kontakt" },
] as const;

export const LANDING_FOOTER_NAV_GROUPS = [
  { name: "Produkt" as const, links: LANDING_FOOTER_PRODUCT_LINKS },
] as const;

export const LANDING_AUTH_PATHS = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  /** Etter innlogging — samme inngang som dashboard i denne appen. */
  appHome: "/conversations",
} as const;
