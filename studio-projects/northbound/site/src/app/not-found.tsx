import type { Metadata } from "next";
import { copy } from "@/content/copy";
import { site } from "@/content/metadata";
import { data } from "@/lib/data";
import { NotFoundTerrain } from "@/components/motion/NotFoundTerrain";
import { TextLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: site.notFoundTitle };

const nf = copy.microcopy.not_found;

/** Off the map: the land only (no section line, no spots, no route card) and one × in the clearing. */
export default function NotFound() {
  return (
    <main id="main" tabIndex={-1}>
      <section aria-labelledby="nf-title" className="hero hero-404">
        <div className="hero-copy">
          <h1 id="nf-title" className="col-span-4 font-display width-wide text-5xl font-hero md:col-span-8 lg:col-span-7">
            {nf.title}
          </h1>
          <p className="col-span-4 col-start-1 mt-6 max-w-lead text-lg text-ink-soft md:col-span-6 lg:col-span-5">{nf.body}</p>
          <p className="col-span-4 col-start-1 mt-6">
            <TextLink href="/" className="text-sm font-medium">
              {nf.link}
            </TextLink>
          </p>
        </div>
        <div className="terrain-window">
          <NotFoundTerrain marker={data.hero.clearing} />
        </div>
      </section>
    </main>
  );
}
