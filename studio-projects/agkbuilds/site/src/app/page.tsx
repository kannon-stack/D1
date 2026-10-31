import { jsonLd } from "@/content/metadata";
import { Nav } from "@/components/ui/Nav";
import { Hero } from "@/components/sections/Hero";
import { Build } from "@/components/sections/Build";
import { Process } from "@/components/sections/Process";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/sections/Footer";
import { PageEffects } from "@/components/client/PageEffects";

/** One drawing set of four sheets (direction.md): hero 01, parts list 02, method 03, title block 04. */
export default function Home() {
  return (
    <>
      <Nav />
      <main id="main" className="site-layer">
        <Hero />
        <Build />
        <Process />
        <Contact />
      </main>
      <Footer />
      <PageEffects />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
