import { copy, specCopy } from "@/content/copy";
import { miniInner } from "@/assets/minis";
import { data } from "@/lib/data";
import { SectionHead, wordLines } from "@/components/ui/SectionHead";
import { RoastStage } from "@/components/motion/RoastStage";
import { InView } from "@/components/motion/InView";

const rc = copy["roast-curve"];

export function RoastCurve() {
  const drop = data.minis.find((mi) => mi.batch === 214)!.drop;
  return (
    <section id="roast-curve" aria-labelledby="roast-curve-title" className="anchor pt-section-sm pb-section-xs">
      <div className="mx-auto grid max-w-page grid-cols-4 gap-x-gutter px-margin md:grid-cols-8 lg:grid-cols-12">
        <SectionHead
          id="roast-curve-title"
          eyebrow={rc.eyebrow}
          title={wordLines(rc.title, 3)}
          lede={rc.lede}
          className="col-span-4 md:col-span-7 lg:col-span-8 lg:row-start-1 xl:col-span-7"
          ledeClassName="md:w-6/7 lg:w-3/4 xl:w-5/7"
        >
          <p className="mt-4 text-sm text-ink-soft md:w-6/7 lg:w-3/4 xl:w-5/7">{rc.chart.definition}</p>
        </SectionHead>

        {/* The curve card: the physical card in every bag, shown flat like a specimen. */}
        <figure
          aria-label={rc.card.image_alt}
          className="col-span-4 mt-10 grid grid-cols-subgrid items-start md:col-span-3 md:col-start-6 md:grid-cols-1 lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:self-start"
        >
          <InView className="curve-card col-span-2 md:col-span-1">
            <p className="card-wordmark">{copy.footer.wordmark}</p>
            <h3 className="mt-1 text-sm font-semibold">{rc.card.title}</h3>
            <div className="mini-box draw-plot relative my-3 h-16">
              <svg viewBox="0 0 720 160" preserveAspectRatio="none" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: miniInner[214] }} />
              <span className="drop-dot" style={{ left: `${drop.left}%`, top: `${drop.top}%` }} aria-hidden="true" />
            </div>
            <ul className="border-t border-line pt-2">
              {rc.card.lines.map((line, i) => (
                <li key={i} className={`card-line num${i === 0 ? " italic" : ""}`}>
                  {line}
                </li>
              ))}
            </ul>
          </InView>
          <figcaption className="col-span-2 text-sm text-muted md:col-span-1 md:mt-3">{rc.card.caption}</figcaption>
        </figure>
      </div>

      <RoastStage
        chart={rc.chart}
        dateLine={rc.date_line}
        imageAlt={rc.image_alt}
        crossings={data.strip.crossings}
        events={data.profile.events}
        phases={data.profile.phases}
        bt={data.profile.btPerSecond}
        labels={{
          time: specCopy.readoutTime,
          temp: specCopy.readoutTemp,
          A: specCopy.sectionA,
          A2: specCopy.sectionA2,
          tEvent: specCopy.tableEvent,
          tTime: specCopy.tableTime,
          tTemp: specCopy.tableTemp,
          tNote: specCopy.tableNote,
        }}
      />

      <div className="mx-auto mt-12 grid max-w-page grid-cols-4 gap-x-gutter px-margin md:grid-cols-8 lg:grid-cols-12">
        <p className="eyebrow col-span-4 text-muted md:col-span-8 lg:col-span-12">{rc.read_label}</p>
        <ol className="col-span-4 mt-6 grid grid-cols-subgrid gap-y-8 md:col-span-8 lg:col-span-12">
          {rc.annotations.map((a, i) => (
            <li key={a.title} className="col-span-4">
              <span className="survey-marker num" aria-hidden="true">
                {i + 1}
              </span>
              <h3 className="mt-3 font-display width-wide text-xl font-normal">{a.title}</h3>
              <p className="mt-2 max-w-prose text-base text-ink-soft">{a.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
