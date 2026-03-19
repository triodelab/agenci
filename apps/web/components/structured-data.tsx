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
    logo: `${base}/logo.png`,
    description:
      "AI-basert chatbotplattform for å automatisere kundeservice og salg",
    sameAs: [] as string[],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
    </>
  );
}
