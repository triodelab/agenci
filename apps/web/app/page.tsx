import type { Metadata } from "next";
import Script from "next/script";
import { LandingPageView } from "@/modules/landing";

export const metadata: Metadata = {
  title: { absolute: "Agenci — KI-chatassistent for norske nettsteder" },
  description:
    "AI-chatassistent som svarer kunder automatisk — 24/7, basert på din kunnskapsbase. Sett opp på under 5 minutter. Ingen koding.",
  openGraph: {
    title: "Agenci — KI-chatassistent for norske nettsteder",
    description:
      "Svar kunder i chat fra din kunnskapsbase. Dashboard for teamet. Eskalering til menneske når det trengs.",
    url: "https://agenci.no",
    type: "website",
  },
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const orgId = process.env.NEXT_PUBLIC_WIDGET_ORG_ID;
  return (
    <>
      <LandingPageView />
      {orgId && (
        <Script
          src="/widget.iife.js"
          data-organization-id={orgId}
          data-agent-id="j57c6whw940s0jyg62kmdbph5n869gmz"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
