import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/sections/Footer";
import { copy } from "@/content/copy";
import { site } from "@/content/metadata";

// One family, three widths (type.md). Both styles are above the fold, so both preload.
const archivo = Archivo({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  alternates: { canonical: site.canonicalPath },
  openGraph: {
    type: "website",
    siteName: site.og.siteName,
    title: site.og.title,
    description: site.og.description,
    locale: site.locale,
    url: site.canonicalPath,
  },
  twitter: {
    card: "summary_large_image",
    title: site.og.title,
    description: site.og.description,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>
        <a className="skip-link" href="#main">
          {copy.microcopy.skip_link}
        </a>
        <noscript>
          {/* Without JS, every drawn mark shows in its finished state. */}
          <style>{`[data-draw] *, .rc-anim { clip-path: none !important; opacity: 1 !important; transform: none !important; }`}</style>
        </noscript>
        <MotionProvider>
          <Nav />
          {children}
          <Footer />
        </MotionProvider>
      </body>
    </html>
  );
}
