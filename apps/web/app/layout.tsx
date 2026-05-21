import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css";
import "@clerk/ui/themes/shadcn.css";
import "@/styles/tokens.css";
import { AGENCI_LOGO_SRC } from "@/components/logo";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://agenci.no"),
  title: {
    default: "Agenci — KI-chatassistent for norske nettsteder",
    template: "%s | Agenci",
  },
  description:
    "AI-chatassistent som svarer kunder automatisk — 24/7, basert på din kunnskapsbase. Sett opp på under 5 minutter. Norsk support.",
  openGraph: {
    siteName: "Agenci",
    locale: "nb_NO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@agenci_no",
  },
  icons: {
    icon: AGENCI_LOGO_SRC,
    apple: AGENCI_LOGO_SRC,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="no" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <Providers>
          <div className="overflow-x-hidden">
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
