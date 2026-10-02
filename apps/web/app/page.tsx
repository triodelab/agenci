import type { Metadata } from "next";
import { SupportChat } from "@/components/support-chat";
import { LandingPageView } from "@/modules/landing";

export const metadata: Metadata = {
  title: { absolute: "Agenci – kundeservice-chat som kan bedriften din" },
  description:
    "Agenci er en chat på nettsiden din som svarer kundene døgnet rundt, ut fra det som står på nettsiden deres. Booker timer og sender saken til deg når det trengs. Prøv gratis.",
  openGraph: {
    title: "Agenci – kundeservice-chat som kan bedriften din",
    description:
      "En chat på nettsiden som svarer kundene med én gang, døgnet rundt. Du ser alt i dashbordet og tar over når det trengs.",
    url: "https://agenci.no",
    type: "website",
  },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <LandingPageView />
      <SupportChat />
    </>
  );
}
