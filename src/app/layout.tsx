import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import MotionProvider from "@/components/layout/MotionProvider";
import { site, links } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: `${site.name} — Portfolio`,
  authors: [{ name: site.name, url: links.linkedin }],
  creator: site.name,
  keywords: [
    "Harsh Sahu",
    "Full Stack Engineer",
    "NestJS Developer",
    "Next.js Developer",
    "Distributed Systems",
    "Event-driven architecture",
    "PostgreSQL",
    "ClickHouse",
    "Redis",
    "BullMQ",
    "RabbitMQ",
    "AI Engineer",
    "LLM Applications",
    "Web3 Developer",
    "Noida",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "profile",
    url: site.url,
    siteName: `${site.name} — ${site.role}`,
    title: site.title,
    description: site.description,
    locale: site.locale,
    firstName: "Harsh",
    lastName: "Sahu",
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#08080b",
  colorScheme: "dark",
};

/**
 * Structured data describing the person behind the site. Kept in sync with the
 * same config the UI reads, so there is one source of truth for identity.
 */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  jobTitle: site.role,
  description: site.description,
  email: `mailto:${links.email}`,
  url: site.url,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Noida",
    addressRegion: "Uttar Pradesh",
    addressCountry: "IN",
  },
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "AKTU",
  },
  worksFor: {
    "@type": "Organization",
    name: "SDLC Corp Pvt Ltd",
  },
  knowsAbout: [
    "Full Stack Engineering",
    "Distributed Systems",
    "Event-driven Architecture",
    "NestJS",
    "Next.js",
    "PostgreSQL",
    "ClickHouse",
    "Redis",
    "LLM Application Development",
    "Blockchain Integration",
  ],
  sameAs: [links.linkedin, ...(links.github ? [links.github] : [])],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-dvh bg-canvas text-ink antialiased">
        {/* Scroll-reveal elements start transparent. Without JavaScript that
            animation never runs, so force them visible rather than shipping a
            page whose content depends on a script executing. */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          // Serialised from a local object literal — no external or user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
