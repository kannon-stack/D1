import { copy } from "@/content/copy";
import { SectionHead, wordLines } from "@/components/ui/SectionHead";
import { InView } from "@/components/motion/InView";

const pr = copy.proof;

export function Proof() {
  return (
    <section id="proof" aria-labelledby="proof-title" className="anchor py-section-lg">
      <div className="mx-auto grid max-w-page grid-cols-4 gap-x-gutter px-margin md:grid-cols-8 lg:grid-cols-12">
        <SectionHead
          id="proof-title"
          eyebrow={pr.eyebrow}
          title={wordLines(pr.title, 3)}
          className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-2"
        />

        <figure className="relative col-span-4 mt-12 md:col-span-8 lg:col-span-7 lg:col-start-2">
          <blockquote className="proof-quote">
            <p>
              <span className="quote-mark" aria-hidden="true">
                {"“"}
              </span>
              {pr.quote.text}
            </p>
          </blockquote>
          <figcaption className="eyebrow mt-6 text-ink-soft">
            <span className="sr-only">{pr.quote.label}: </span>
            <cite className="not-italic">
              {pr.quote.name} · {pr.quote.place} · <span className="num">{pr.quote.method}</span>
            </cite>
          </figcaption>
        </figure>

        <div className="col-span-4 mt-12 md:col-span-8 lg:col-span-4 lg:col-start-9 lg:row-start-2">
          <div className="flex flex-col gap-3">
            <p className="eyebrow text-muted">{pr.sourcing.label}</p>
            <h3 className="font-display width-wide text-xl font-normal">{pr.sourcing.headline}</h3>
            <p className="max-w-prose text-base text-ink-soft">{pr.sourcing.body}</p>
          </div>

          <InView className="mt-12 lg:mt-10" amount={0.5}>
            <div className="flex items-end gap-4">
              <p className="font-display width-wide num shrink-0 text-4xl font-light xl:text-5xl">{pr.stat.value}</p>
              <span className="stat-leader" aria-hidden="true" />
            </div>
            <p className="mt-3 max-w-narrow text-sm text-ink-soft lg:mt-8">{pr.stat.label}</p>
          </InView>
        </div>
      </div>
    </section>
  );
}
