import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"

import "@workspace/ui/globals.css";
import "@clerk/ui/themes/shadcn.css";
import "@/styles/tokens.css";
import { Providers } from "@/components/providers"
import { Toaster } from "@workspace/ui/components/sonner";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://agenci.no"),
  title: {
    default: "Agenci — KI-chatassistent for norske nettsteder",
    template: "%s | Agenci",
  },
  description:
    "AI-chatassistent som svarer kunder automatisk — 24/7, basert på din kunnskapsbase. Sett opp på under 5 minutter. Norsk support.",
  keywords: [
    "AI chatbot norsk",
    "chatassistent nettside",
    "KI kundestøtte",
    "automatisk kundeservice",
    "chat widget norsk",
    "AI agent bedrift",
    "chatbot norske bedrifter",
  ],
  openGraph: {
    siteName: "Agenci",
    locale: "nb_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@agenci_no",
  },
  robots: { index: true, follow: true },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Agenci",
  url: "https://agenci.no",
  logo: "https://agenci.no/AgenciLogo.png",
  description:
    "AI-chatassistent for norske nettsteder — svarer kunder automatisk 24/7.",
  email: "hei@agenci.no",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Gildevangen 16 B",
    addressLocality: "Oslo",
    postalCode: "0657",
    addressCountry: "NO",
  },
  contactPoint: {
    "@type": "ContactPoint",
    email: "hei@agenci.no",
    contactType: "customer support",
    availableLanguage: "Norwegian",
  },
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Agenci",
  url: "https://agenci.no",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="no" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontDisplay.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
        <Script
          id="json-ld-organization"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <Script
          id="json-ld-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </body>
    </html>
  )
}
