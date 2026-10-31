import type { CSSProperties } from "react";
import { Triangle } from "@/components/ui/Triangle";
import { copy } from "@/content/copy";
import { miniInner } from "@/assets/minis";
import { data, yPct } from "@/lib/data";
import { SectionHead } from "@/components/ui/SectionHead";
import { ButtonLink } from "@/components/ui/Button";
import { InView } from "@/components/motion/InView";

const r = copy.roasts;
const L = r.labels;

type Batch = 212 | 213 | 214;
const batchOf = (s: string) => Number(s.replace(/\D/g, "")) as Batch;
const dropC = (s: string) => Number(s.replace(/[^\d.]/g, ""));
/** Shared roast-level scale: 198 → 218 °C. */
const levelPct = (drop: string) => ((dropC(drop) - 198) / 20) * 100;
const SCALE_TICKS = [0, 25, 50, 75, 100];
const GRID = [200, 150, 100];

function Scale({
  markers,
  label,
  describedBy,
  showFill = true,
}: {
  markers: { pct: number; tag?: string; delay: number }[];
  label: string;
  describedBy?: string;
  showFill?: boolean;
}) {
  return (
    <div className="level-scale" role="img" aria-label={label} aria-describedby={describedBy}>
      <span className="level-end">{r.scale_min}</span>
      <span className="level-track" aria-hidden="true">
        {SCALE_TICKS.map((t) => (
          <span key={t} className="level-tick" style={{ left: `${t}%` }} />
        ))}
        {showFill && (
          <span className="level-fill" style={{ width: `${markers[0].pct}%`, "--d": `${markers[0].delay}ms` } as CSSProperties} />
        )}
        {markers.map((m) => (
          <span key={m.pct} className="level-marker" style={{ left: `${m.pct}%`, "--d": `${m.delay + 1100}ms` } as CSSProperties}>
            {m.tag && <span className="level-tag num">{m.tag}</span>}
            <span className="level-glyph"><Triangle dir="down" /></span>
          </span>
        ))}
      </span>
      <span className="level-end">{r.scale_max}</span>
    </div>
  );
}

function Mini({ batch, delay }: { batch: Batch; delay: number }) {
  const drop = data.minis.find((m) => m.batch === batch)!.drop;
  return (
    <div className="mini-box draw-plot absolute inset-0" style={{ "--d": `${delay}ms` } as CSSProperties}>
      <svg viewBox="0 0 720 160" preserveAspectRatio="none" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: miniInner[batch] }} />
      <span className="drop-dot drop-dot-sm" style={{ left: `${drop.left}%`, top: `${drop.top}%` }} aria-hidden="true" />
    </div>
  );
}

/** sm/md: the three curves overlaid on one domain, with direct labels and one shared scale. */
function ComparisonPlate() {
  // Direct labels, ordered by drop temperature (hottest on top), 18px apart.
  const byDrop = [...r.items].sort((a, b) => dropC(b.drop) - dropC(a.drop));
  const order: Batch[] = [212, 213, 214]; // R1 stagger order
  return (
    <InView className="plate col-span-4 md:col-span-8 lg:hidden">
      <div className="plate-chart" role="img" aria-label={r.items.map((it) => it.mini_alt).join(" ")}>
        <div className="plate-curves">
          {GRID.map((T) => (
            <span key={T} className="plate-grid" style={{ top: `${yPct(T)}%` }}>
              <span className="plate-grid-label num">{T}°</span>
            </span>
          ))}
          {order.map((b, i) => (
            <div key={b} className={`plate-${b} absolute inset-0`}>
              <Mini batch={b} delay={i * 120} />
            </div>
          ))}
          {byDrop.map((it) => {
            const d = data.minis.find((m) => m.batch === batchOf(it.batch))!.drop;
            return <span key={it.batch} className="plate-leader-h" style={{ left: `${d.left}%`, top: `${d.top}%` }} />;
          })}
        </div>
        <div className="plate-gutter" aria-hidden="true">
          <svg viewBox="0 0 88 192" className="absolute inset-0 h-full w-full overflow-visible" focusable="false">
            {byDrop.map((it, i) => {
              const d = data.minis.find((m) => m.batch === batchOf(it.batch))!.drop;
              return <line key={it.batch} x1="0" y1={(d.top / 100) * 192} x2="8" y2={8 + i * 18} className="plate-leader" />;
            })}
          </svg>
          {byDrop.map((it, i) => (
            <span key={it.batch} className="plate-label num" style={{ top: `${8 + i * 18}px` }}>
              {batchOf(it.batch)} {it.name}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <Scale
          label={`${r.scale_label}: ${r.items.map((it) => `${it.name} ${it.roast_level}, ${L.drop.toLowerCase()} ${it.drop}`).join("; ")}`}
          markers={r.items.map((it, i) => ({ pct: levelPct(it.drop), tag: String(batchOf(it.batch)), delay: i * 120 }))}
          showFill={false}
        />
        <p className="mt-3 text-sm text-muted">{r.scale_note}</p>
      </div>
    </InView>
  );
}

export function Roasts() {
  return (
    <section id="roasts" aria-labelledby="roasts-title" className="anchor pt-section-xs pb-section-sm">
      <div className="mx-auto grid max-w-page grid-cols-4 gap-x-gutter px-margin md:grid-cols-8 lg:grid-cols-12">
        <SectionHead id="roasts-title" eyebrow={r.eyebrow} title={r.title} lede={r.lede} />

        <div className="col-span-4 mt-12 grid grid-cols-subgrid gap-y-4 md:col-span-8 lg:col-span-12">
          <ComparisonPlate />

          <div className="roast-grid col-span-4 md:col-span-8 lg:col-span-12">
            {/* lg+: one set of temperature gridlines through all three cards, edge to edge. */}
            <div className="axis-band" aria-hidden="true">
              {GRID.map((T) => (
                <span key={T} className="axis-line" style={{ top: `${yPct(T)}%` }}>
                  <span className="axis-label num">{T}°</span>
                </span>
              ))}
            </div>

            {r.items.map((it, i) => {
              const b = batchOf(it.batch);
              const nameId = `roast-${b}`;
              const noteId = `scale-note-${b}`;
              return (
                <article key={b} aria-labelledby={nameId} className="roast-card">
                  <div className="flex items-baseline justify-between gap-3 border-b border-line pb-3">
                    <p className="eyebrow text-ink">{it.batch}</p>
                    <p className="width-map num text-xs text-muted">
                      {L.roasted} {it.roasted}
                    </p>
                  </div>
                  <h3 id={nameId} className="font-display width-semi text-2xl font-normal md:width-wide">
                    {it.name}
                  </h3>
                  <p className="place-name">
                    {it.country} · <span className="num">{it.latitude}</span>
                  </p>

                  <div className="roast-mini hidden lg:block" role="img" aria-label={it.mini_alt}>
                    <InView className="absolute inset-0">
                      <Mini batch={b} delay={i * 120} />
                    </InView>
                  </div>
                  <p className="data-line hidden lg:block">
                    {L.drop} {it.drop_time} · {it.drop} · {L.dtr} {it.dtr}
                  </p>
                  <p className="text-sm font-semibold lg:hidden">
                    {it.roast_level} · <span className="num">{it.drop}</span> · {L.dtr} <span className="num">{it.dtr}</span>
                  </p>
                  <InView className="hidden lg:block">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="eyebrow text-muted">{r.scale_label}</span>
                      <span className="text-sm font-semibold">{it.roast_level}</span>
                    </div>
                    <div className="mt-2">
                      <Scale
                        label={`${r.scale_label}: ${it.roast_level}, ${L.drop.toLowerCase()} ${it.drop}`}
                        describedBy={noteId}
                        markers={[{ pct: levelPct(it.drop), delay: i * 120 + 1100 }]}
                      />
                      <span id={noteId} className="sr-only">
                        {r.scale_note}
                      </span>
                    </div>
                  </InView>

                  <dl className="roast-dl">
                    <div>
                      <dt>{L.producer}</dt>
                      <dd>{it.producer}</dd>
                    </div>
                    <div>
                      <dt>{L.process}</dt>
                      <dd>{it.process}</dd>
                    </div>
                    <div>
                      <dt>{L.elevation}</dt>
                      <dd className="num">{it.elevation}</dd>
                    </div>
                    <div>
                      <dt>{L.first_crack}</dt>
                      <dd className="num">{it.first_crack}</dd>
                    </div>
                    <div>
                      <dt>{L.notes}</dt>
                      <dd>
                        {/* Lines break after a separator, never before one (R1-06). */}
                        {it.notes.map((n, j) => (
                          <span key={n}>
                            <span className="whitespace-nowrap">
                              {n}
                              {j < it.notes.length - 1 ? " ·" : ""}
                            </span>
                            {j < it.notes.length - 1 ? " " : ""}
                          </span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt>{L.brew}</dt>
                      <dd className="num">{it.brew}</dd>
                    </div>
                  </dl>

                  <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
                    <span className="eyebrow text-muted">{L.bag}</span>
                    <span className="font-display width-wide num text-xl font-normal">{it.bag}</span>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="col-span-4 mt-4 text-sm text-muted md:col-span-8 lg:col-span-6 lg:mt-8 lg:self-center">{r.price_note}</p>
          <div className="col-span-4 md:col-span-8 lg:col-span-3 lg:col-start-10 lg:mt-8 lg:flex lg:justify-end">
            <ButtonLink href="#subscribe" className="w-full justify-between lg:w-auto">
              {r.cta}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
