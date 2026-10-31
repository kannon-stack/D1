import { Hero } from "@/components/sections/Hero";
import { RoastCurve } from "@/components/sections/RoastCurve";
import { Roasts } from "@/components/sections/Roasts";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Proof } from "@/components/sections/Proof";
import { Subscribe } from "@/components/sections/Subscribe";
import { jsonLd } from "@/content/metadata";

export default function Home() {
  return (
    <main id="main" tabIndex={-1}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <RoastCurve />
      <Roasts />
      <HowItWorks />
      <Proof />
      <Subscribe />
    </main>
  );
}
