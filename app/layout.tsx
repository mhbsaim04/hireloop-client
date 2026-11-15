import { Geist, Geist_Mono, Manrope, Instrument_Sans } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-manrope",
})

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-instrument",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable, manrope.variable, instrumentSans.variable)}
    >
      <body>
        <ThemeProvider defaultTheme="dark">
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
