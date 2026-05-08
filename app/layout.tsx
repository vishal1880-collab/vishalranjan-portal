import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/react";
import { SITE, ADSENSE_CLIENT, GSC_VERIFICATION } from "@/lib/site";
import { getProfile } from "@/lib/content";
import { PersonJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.title, template: "%s — Vishal Ranjan" },
  description: SITE.description,
  applicationName: "vishalranjan.com",
  authors: [{ name: SITE.author, url: SITE.url }],
  creator: SITE.author,
  publisher: SITE.author,
  keywords: [
    "Vishal Ranjan",
    "IMARC",
    "IMARC Services",
    "Claight Corporation",
    "KAMRIT Financial Services",
    "market research",
    "founder",
    "indie tools",
    "QR generator",
    "email checker"
  ],
  alternates: { canonical: SITE.url },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: "vishalranjan.com",
    title: SITE.title,
    description: SITE.description,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Vishal Ranjan" }]
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/og.png"]
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  verification: GSC_VERIFICATION ? { google: GSC_VERIFICATION } : undefined,
  icons: { icon: "/favicon.ico", apple: "/apple-touch-icon.png" }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = getProfile();
  return (
    <html lang="en">
      <head>
        <PersonJsonLd profile={profile} url={SITE.url} />
        {ADSENSE_CLIENT && (
          <Script
            id="adsense-init"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col">
        <header className="border-b border-gray-200">
          <nav className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
            <Link href="/" className="font-semibold tracking-tight">
              vishalranjan<span className="text-accent">.com</span>
            </Link>
            <ul className="flex gap-6 text-sm text-gray-700">
              <li><Link href="/tools" className="hover:text-accent">Tools</Link></li>
              <li><Link href="/companies" className="hover:text-accent">Companies</Link></li>
              <li><Link href="/blog" className="hover:text-accent">Blog</Link></li>
              <li><Link href="/request-email" className="hover:text-accent">Get an @vishalranjan.com</Link></li>
              <li><Link href="/contact" className="hover:text-accent">Contact</Link></li>
            </ul>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-gray-200 mt-16">
          <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-gray-600">
            <p>© {new Date().getFullYear()} Vishal Ranjan. All rights reserved.</p>
            <ul className="flex gap-5">
              <li><Link href="/privacy" className="hover:text-accent">Privacy</Link></li>
              <li><Link href="/sitemap.xml" className="hover:text-accent">Sitemap</Link></li>
              <li><Link href="/rss.xml" className="hover:text-accent">RSS</Link></li>
            </ul>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
