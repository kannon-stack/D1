import { copy } from "@/content/copy";
import { Triangle } from "@/components/ui/Triangle";
import { SectionHead, sentenceLines } from "@/components/ui/SectionHead";
import { SubscribeForm } from "@/components/motion/SubscribeForm";

const s = copy.subscribe;

export function Subscribe() {
  return (
    <section id="subscribe" aria-labelledby="subscribe-title" className="anchor py-section-md">
      <div className="subscribe-grid mx-auto grid max-w-page grid-cols-4 gap-x-gutter px-margin md:grid-cols-8 lg:grid-cols-12">
        <SectionHead
          id="subscribe-title"
          eyebrow={s.eyebrow}
          title={sentenceLines(s.title)}
          lede={s.lede}
          className="col-span-4 md:col-span-8 lg:col-span-6 lg:row-start-1"
        />

        <div className="subscribe-panel col-span-4 mt-10 md:col-span-8 lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:mt-0">
          <SubscribeForm s={s} f={copy.microcopy.form} />
        </div>

        <div className="col-span-4 mt-10 flex flex-col md:col-span-8 lg:col-span-5 lg:row-start-2">
          <h3 className="eyebrow text-muted">{s.included_title}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {s.included.map((item) => (
              <li key={item} className="flex gap-3 text-base text-ink-soft">
                <span className="bullet-summit" aria-hidden="true">
                  <Triangle />
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-sm font-semibold">{s.reassurance}</p>
          <p className="mt-12 font-display width-wide text-xl font-normal lg:mt-auto lg:pt-12">{s.closing}</p>
        </div>
      </div>
    </section>
  );
}
