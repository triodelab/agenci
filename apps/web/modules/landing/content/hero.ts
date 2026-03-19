/**
 * Markedsføringsinnhold for hero/podium (data, ikke «config» — holdes utenfor ui/).
 */

import {
  LANDING_AUTH_PATHS,
  LANDING_SECTION_IDS,
} from "@/modules/landing/constants";

export const heroCtas = [
  {
    label: "Start gratis prøveperiode",
    href: LANDING_AUTH_PATHS.signIn,
    variant: "primary" as const,
  },
  {
    label: "Book demo",
    href: `/#${LANDING_SECTION_IDS.contact}`,
    variant: "secondary" as const,
  },
] as const;

export type HeroCta = (typeof heroCtas)[number];

export const heroMiniFeatures = [
  {
    title: "Unike widgeter og dashboards",
    description:
      "Bygg dashboards med tilpassede widgeter og full kontroll fra ett sted.",
  },
  {
    title: "Rask og brukervennlig",
    description: "Sett opp chatbot på minutter, uten tekniske krav.",
  },
  {
    title: "Alt du trenger i én plattform",
    description:
      "Kundeservice i bredden — FAQ, support, booking, salg og innsikt samlet i Agenci.",
  },
] as const;

export const heroStats = [
  { label: "Tilgjengelig for kunder døgnet rundt", value: "24/7" },
  { label: "Én kunnskapsbase på tvers av kanaler", value: "1" },
  { label: "Fra oppstart til live chatbot", value: "Minutter" },
  { label: "Full styring og innsikt i dashboard", value: "Du styrer" },
] as const;

export type HeroStat = (typeof heroStats)[number];

export const podiumHeadline = "Mer kundeservice. Samme team.";
export const podiumSupporting =
  "Agenci svarer kunder raskt og riktig, 24/7 — på alt fra FAQ og reklamasjon til booking og support. Du bestemmer innholdet; vi tar de repetitive samtalene.";
