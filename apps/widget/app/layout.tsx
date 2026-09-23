import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { LoaderIcon } from "lucide-react";

import "@workspace/ui/globals.css";
import "../../web/styles/tokens.css";
import { Providers } from "@/components/providers";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

/**
 * Circular (Agencis stemme) — kun for bot-svar i chatten, se
 * --font-bot-voice i ../../web/styles/tokens.css. For å reversere til
 * standard UI-skrift: fjern denne, fontCircular.variable under, og sett
 * --font-bot-voice tilbake til var(--font-agenci-body) i tokens.css.
 */
const fontCircular = localFont({
  src: [
    { path: "../../web/public/fonts/Circular-Font-Family/lineto-circular-book.ttf", weight: "400", style: "normal" },
    { path: "../../web/public/fonts/Circular-Font-Family/lineto-circular-bookItalic.ttf", weight: "400", style: "italic" },
    { path: "../../web/public/fonts/Circular-Font-Family/lineto-circular-medium.ttf", weight: "500", style: "normal" },
  ],
  variable: "--font-circular",
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${fontCircular.variable} font-sans antialiased `}
      >
        <Providers>
          <Suspense
            fallback={
              <div className="flex min-h-[100dvh] w-full items-center justify-center bg-background text-muted-foreground">
                <LoaderIcon aria-hidden className="size-8 animate-spin" />
              </div>
            }
          >
            {children}
          </Suspense>
        </Providers>
      </body>
    </html>
  )
}
