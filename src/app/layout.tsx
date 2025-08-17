import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { TRPCProvider } from "@/lib/trpc/client"
import { SessionProvider } from "@/components/providers/SessionProvider"
import { Toaster } from "@/components/ui/sonner"
// import { initializeAxe } from "@/lib/testing/accessibility" // Disabled for production build
import { SkipToContent } from "@/components/accessibility/SkipToContent"
import { ErrorBoundary } from "@/components/error/ErrorBoundary"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'optional',
})

export const metadata: Metadata = {
  title: "HMS - Home Management System",
  description: "Home Management System - Den enkle måten å holde oversikt over alle dine eiendeler med QR-koder og smart organisering",
  keywords: ["inventar", "organisering", "hjemme", "QR-kode", "garn", "hobby", "home management"],
  authors: [{ name: "HMS Team" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HMS",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "HMS",
    title: "HMS - Home Management System",
    description: "Home Management System - Den enkle måten å holde oversikt over alle dine eiendeler",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

// Initialize accessibility testing in development
// if (typeof window !== "undefined") {
//   initializeAxe()
// }

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="no" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <SkipToContent />
        <ErrorBoundary>
          <SessionProvider>
            <TRPCProvider>
              <div className="relative flex min-h-screen flex-col">
                <main id="main-content" className="flex-1" tabIndex={-1}>
                  {children}
                </main>
              </div>
              <Toaster />
            </TRPCProvider>
          </SessionProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
