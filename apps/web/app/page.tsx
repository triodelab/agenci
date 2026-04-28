import type { Metadata } from "next";
import { LandingPageView } from "@/modules/landing";

export const metadata: Metadata = {
  title: "Agenci — KI-chat på nettsiden med kunnskap dere styrer",
  description:
    "Chat-widget som svarer ut fra deres innhold (filer og nettsider), samtaler i dashboard og overtagelse til mennesker når det trengs.",
  openGraph: {
    title: "Agenci — KI-chat på nettsiden",
    description:
      "Svar kunder i chat fra egen kunnskapsbase. Dashboard for teamet. Eskalering til menneske når saken krever det.",
    url: "/",
  },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <LandingPageView />;
}
