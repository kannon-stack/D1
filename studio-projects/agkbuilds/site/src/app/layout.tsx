import type { Metadata, Viewport } from "next";
import "./globals.css";
import { archivo, archivoWide, mono } from "./fonts";
import { copy } from "@/content/copy";
import { site, siteUrl } from "@/content/metadata";

// No absolute URL unless the domain is known (decisions #13): metadataBase, canonical and og:url
// exist only when NEXT_PUBLIC_SITE_URL is set at build time.
export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl), alternates: { canonical: "/" } } : {}),
  title: site.title,
  description: site.description,
  openGraph: {
    type: site.og.type,
    siteName: copy.contact.drawn_by,
    title: site.og.title,
    description: site.og.description,
    locale: site.locale,
    ...(siteUrl ? { url: "/" } : {}),
  },
  twitter: {
    card: site.twitter.card,
    title: site.twitter.title,
    description: site.twitter.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#101419" },
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
  ],
};

// Sets .js before first paint, so in-view reveals (build, contact) start hidden only when the
// script that reveals them can run. Without JS everything shows in its finished state.
const jsFlag = "document.documentElement.classList.add('js')";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${archivoWide.variable} ${archivo.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          {copy.microcopy.skip_link}
        </a>
        <div className="sheet-guides" aria-hidden="true">
          <div className="wrap">
            <div className="sheet" />
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
