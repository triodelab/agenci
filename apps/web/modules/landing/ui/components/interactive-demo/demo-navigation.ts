import {
  CreditCard,
  Home,
  Inbox,
  LibraryBig,
  Mic,
  Palette,
  Plug,
} from "lucide-react";

/** Mirrors the agent sidebar in the real dashboard (apps/dashboard). */
export const demoNavigation = [
  { id: "overview", label: "Oversikt", icon: Home },
  { id: "conversations", label: "Samtaler", icon: Inbox },
  { id: "knowledge", label: "Kunnskapsbase", icon: LibraryBig },
  { id: "widget", label: "Widget-tilpasning", icon: Palette },
  { id: "integrations", label: "Integrasjoner", icon: Plug },
  { id: "voice", label: "Stemmeassistent", icon: Mic },
  { id: "billing", label: "Plan og faktura", icon: CreditCard },
] as const;

export const DEMO_AGENT = "Nordlys";
