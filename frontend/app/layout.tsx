import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { HelpChatWidget } from "@/components/chat/help-chat-widget"
import { AuthProvider } from "@/components/auth/AuthProvider"
import { QueryProvider } from "@/components/providers/QueryProvider"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FacilityHub - Find Your Perfect Space",
    template: "%s | FacilityHub",
  },
  description:
    "Discover and book premium facilities for events, meetings, and gatherings with our comprehensive facility management platform",
  applicationName: "FacilityHub",
  authors: [{ name: "FacilityHub" }],
  keywords: [
    "facility booking",
    "event spaces",
    "meeting rooms",
    "rentals",
    "Ghana",
    "Accra",
  ],
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "FacilityHub - Find Your Perfect Space",
    description:
      "Discover and book premium facilities for events, meetings, and gatherings with our comprehensive facility management platform",
    siteName: "FacilityHub",
    images: [
      {
        url: "/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "FacilityHub",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "FacilityHub - Find Your Perfect Space",
    description:
      "Discover and book premium facilities for events, meetings, and gatherings with our comprehensive facility management platform",
    images: ["/placeholder.jpg"],
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/placeholder-logo.svg",
    shortcut: "/placeholder-logo.png",
  },
  category: "travel",
  classification: "facility booking platform",
  generator: "v0.dev",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#0f172a",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-white`}>
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster />
            <HelpChatWidget />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
