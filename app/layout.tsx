import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css" // Import globals.css at the top of the file
import "./styles.css"
import { Toaster } from "@/components/ui/toaster"
import { ShadowStoreProvider } from "@/store/shadowStore"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Abnormal Shadow IT",
  description: "Cyberpunk-inspired security operations dashboard for shadow IT detection",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-background text-foreground font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-accent-foreground focus:rounded-md focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        <ShadowStoreProvider>
          {children}
          <Toaster />
        </ShadowStoreProvider>
      </body>
    </html>
  )
}
