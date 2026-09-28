import type { Metadata } from "next";
import Script from "next/script";
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
  const orgId = process.env.NEXT_PUBLIC_WIDGET_ORG_ID;
  const agentId = process.env.NEXT_PUBLIC_WIDGET_AGENT_ID;
  return (
    <>
      <LandingPageView />
      {orgId && (
        <Script
          src="/widget.iife.js"
          data-organization-id={orgId}
          {...(agentId ? { "data-agent-id": agentId } : {})}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
