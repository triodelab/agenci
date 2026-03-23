import { Geist, Geist_Mono } from "next/font/google"

import "@workspace/ui/globals.css";
import "../../web/styles/tokens.css";
import { Providers } from "@/components/providers"

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased `}
      >
        <Providers>
          <div className="box-border flex min-h-screen w-full items-start justify-center bg-[var(--hero-bg)] p-3 sm:items-center sm:p-4 dark:bg-background">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}
