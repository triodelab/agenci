import { AGENCI_LOGO_SRC } from "@/components/logo";

/** Sikker serialisering i <script type="application/ld+json"> (unngår `</script>` i strenger som bryter HTML). */
function jsonLdStringify(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function StructuredData() {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://agenci.no";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Agenci",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "NOK" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1",
    },
    description:
      "AI-basert chatbotplattform som automatiserer kundeservice og salg med 24/7 support, dashboard for kontroll og voice-assistent (premium).",
    featureList: [
      "AI Chatbot Widget",
      "Dashboard med innsikt",
      "Human takeover",
      "Voice assistant (Premium)",
      "Integrasjoner",
      "GDPR-kompatibel",
    ],
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Agenci",
    url: base,
    logo: `${base}${AGENCI_LOGO_SRC}`,
    description:
      "AI-basert chatbotplattform for å automatisere kundeservice og salg",
    sameAs: [] as string[],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdStringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdStringify(organizationData) }}
      />
    </>
  );
}
