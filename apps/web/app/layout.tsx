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

export const metadata = {
  icons: {
    icon: AGENCI_LOGO_SRC,
    apple: AGENCI_LOGO_SRC,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="no" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased overflow-x-hidden`}
      >
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  )
}
