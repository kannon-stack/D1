import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { site } from "@/content/metadata";
import { Nav } from "@/components/ui/Nav";
import { Footer } from "@/components/sections/Footer";

export const metadata: Metadata = { title: site.notFoundTitle };

/** Minimal 404 (exported as 404.html): the same sheet, one heading, one way back. */
export default function NotFound() {
  const nf = copy.microcopy.not_found;
  return (
    <>
      <Nav base="/" />
      <main id="main" className="site-layer">
        <section aria-labelledby="nf-title" className="pt-section-sm pb-section-md">
          <div className="wrap">
            <div className="grid grid-cols-4 gap-x-gutter md:grid-cols-8 lg:grid-cols-12">
              <div className="col-span-4 md:col-span-6 lg:col-span-7">
                <h1 id="nf-title" className="text-3xl md:text-5xl">
                  {nf.title}
                </h1>
                <p className="mt-6 max-w-narrow text-lg text-ink-soft">{nf.body}</p>
                <p className="mt-8">
                  <a href={nf.cta_href} className="text-link annotate inline-flex min-h-11 items-center">
                    {nf.cta}
                    <span aria-hidden="true">&nbsp;→</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer base="/" />
    </>
  );
}
