import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk } from "next/font/google"
import localFont from "next/font/local"

import "@workspace/ui/globals.css";
import "@/styles/tokens.css";
import "@/styles/marketing.css";
import { Providers } from "@/components/providers"
import { Toaster } from "@workspace/ui/components/sonner";

/**
 * Designsystem v1 – fire skrifter (se DESIGN.md):
 *  - Gellix (titler)              → --font-gellix    (public/fonts/gellix)
 *  - Inter (løpetekst, UI)        → --font-sans
 *  - Space Grotesk (etiketter)    → --font-display
 *  - Circular (Agencis stemme)    → --font-circular  (public/fonts/Circular-Font-Family)
 */
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
})

const fontGellix = localFont({
  src: [
    { path: "../public/fonts/gellix/Gellix-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/gellix/Gellix-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/gellix/Gellix-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../public/fonts/gellix/Gellix-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-gellix",
  display: "swap",
})

const fontCircular = localFont({
  src: [
    { path: "../public/fonts/Circular-Font-Family/lineto-circular-book.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/Circular-Font-Family/lineto-circular-bookItalic.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/Circular-Font-Family/lineto-circular-medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-circular",
  display: "swap",
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
    <html lang="nb" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${fontSans.variable} ${fontDisplay.variable} ${fontGellix.variable} ${fontCircular.variable} font-sans antialiased`}
      >
        {/* Cookie consent (Cookiebot). Loads before any app code so auto
            blocking can hold back cookie-setting scripts until consent. */}
        <Script
          id="Cookiebot"
          src="https://consent.cookiebot.com/uc.js"
          data-cbid="dd791730-a0c2-4186-b0c3-0ff08912f17f"
          data-blockingmode="auto"
          type="text/javascript"
          strategy="beforeInteractive"
        />
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
