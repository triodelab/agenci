import type { Metadata } from "next";
import { LandingPageView } from "@/modules/landing";

export const metadata: Metadata = {
  title: "Automatiser kundeservice og salg med AI",
  description:
    "Agenci er en AI-basert chatbotplattform som svarer raskt og riktig 24/7, reduserer supportkostnader, øker konvertering og gir deg full kontroll via dashboard.",
  openGraph: {
    title: "Agenci - Automatiser kundeservice og salg med AI",
    description:
      "Agenci er en AI-basert chatbotplattform som svarer raskt og riktig 24/7, reduserer supportkostnader, øker konvertering og gir deg full kontroll via dashboard.",
    url: "/",
  },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <LandingPageView />;
}
