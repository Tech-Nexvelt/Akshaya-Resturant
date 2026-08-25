import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { ProductionProtection } from "@/components/common/ProductionProtection";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-src",
  display: "swap",
});

const body = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body-src",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://akshayarestaurant.in"),
  title: "Akshaya | A Legacy of Flavor Since 2007",
  description:
    "Akshaya Family Restaurant — authentic Telangana dining, a cafe, banquet halls, and outdoor catering in Siddipet. A legacy of flavor since 2007.",
};

/**
 * Viewport export — CRITICAL for mobile.
 * Without this, iOS Safari renders at ~980px desktop width and zooms out,
 * breaking all responsive breakpoints. maximumScale=5 allows user zoom
 * for accessibility but prevents automatic form-field zoom on focus.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0f14" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta httpEquiv="Content-Security-Policy" content="upgrade-insecure-requests" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ProductionProtection />
        <div className="noise-overlay" />
        {children}
      </body>
    </html>
  );
}
