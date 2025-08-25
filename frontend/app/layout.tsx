import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { EnhancedChatWidget } from "@/components/chat/enhanced-chat-widget";
import { ThemeProvider } from "@/components/theme-provider";
import { TanstackProvider } from "@/components/TanstackProvider";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "FacilityHub - Find Your Perfect Space",
  description:
    "Discover and book premium facilities for events, meetings, and gatherings with our comprehensive facility management platform",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
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
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-white`}
      >
        <ErrorBoundary>
          <TanstackProvider>
            <ThemeProvider>
              <NotificationProvider>
                <Header />
                {children}
                <Footer />
              </NotificationProvider>
            </ThemeProvider>
            <Toaster />
            <EnhancedChatWidget />
          </TanstackProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
