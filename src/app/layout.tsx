import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { MobileNavigation } from '@/components/Navigation'

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "DisasterLens - Emergency Response Dashboard",
  description: "Real-time emergency response dashboard that aggregates disaster data, classifies it with AI, and displays it in a unique, standout UI.",
  keywords: ["emergency", "disaster", "response", "dashboard", "AI", "real-time"],
  authors: [{ name: "DisasterLens Team" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚨</text></svg>" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <MobileNavigation />
      </body>
    </html>
  );
}
