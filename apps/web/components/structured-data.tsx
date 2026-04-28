import { AGENCI_LOGO_SRC } from "@/components/logo";
import { getSiteUrl } from "@/lib/site-url";

/** Sikker serialisering i <script type="application/ld+json"> (unngår `</script>` i strenger som bryter HTML). */
function jsonLdStringify(value: unknown) {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function StructuredData() {
  const base = getSiteUrl();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Agenci",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Agenci er en KI-drevet chat for nettsiden som svarer ut fra bedriftens eget innhold, samler samtaler i et dashboard og lar teamet overta når det trengs. Valgfri taleutvidelse på høyere nivåer.",
    featureList: [
      "Chat-widget på nettsiden",
      "Kunnskapsbase (filer og nettsider) med vektorsøk",
      "Dashboard for samtaler",
      "Eskalering til menneske",
      "Valgfri tale (Vapi / Pro)",
      "Widget-innbygging for vanlige rammeverk",
    ],
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Agenci",
    url: base,
    logo: `${base}${AGENCI_LOGO_SRC}`,
    description:
      "Plattform for KI-drevet kundedialog på nett med widget, kunnskapsgrunnlag og dashboard.",
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
