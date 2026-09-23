import {
  Bot,
  CreditCard,
  Home,
  Inbox,
  LibraryBig,
  Mic,
  Palette,
  PanelsTopLeft,
} from "lucide-react";

export const demoNavigation = [
  {
    id: "overview",
    label: "Oversikt",
    icon: Home,
    group: "KUNDESTØTTE",
    description: "Status og oppsett.",
  },
  {
    id: "conversations",
    label: "Konversasjoner",
    icon: Inbox,
    group: "KUNDESTØTTE",
    description: "Innboks, svar og eskalering.",
  },
  {
    id: "knowledge",
    label: "Kunnskapsbase",
    icon: LibraryBig,
    group: "KUNDESTØTTE",
    description: "Filer og kilder for RAG.",
  },
  {
    id: "widget",
    label: "Widget-tilpasning",
    icon: Palette,
    group: "TILPASNING",
    description: "Utseende og tekster.",
  },
  {
    id: "integrations",
    label: "Integrasjoner",
    icon: PanelsTopLeft,
    group: "TILPASNING",
    description: "Bygg inn på nettsiden.",
  },
  {
    id: "voice",
    label: "Stemmeassistent",
    icon: Mic,
    group: "TILPASNING",
    description: "Tale inn og ut.",
  },
  {
    id: "billing",
    label: "Plan og faktura",
    icon: CreditCard,
    group: "KONTO",
    description: "Abonnement.",
  },
  {
    id: "agents",
    label: "Agenter",
    icon: Bot,
    group: "KONTO",
    description: "Modell og verktøy.",
  },
] as const;
