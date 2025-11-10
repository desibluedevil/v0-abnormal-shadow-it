import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { ShadowStoreProvider } from "@/store/shadowStore"

export const metadata: Metadata = {
  title: "Shadow IT Dashboard",
  description: "Admin dashboard for managing shadow IT applications",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`bg-background text-foreground font-sans antialiased`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#47D7FF] focus:text-[#0B0F12] focus:rounded-md focus:font-semibold focus:shadow-lg focus:ring-2 focus:ring-[#47D7FF] focus:ring-offset-2 focus:ring-offset-background"
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
