"use client";

import * as m from "motion/react-m";
import {
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { Crossing, Phase, ProfileEvent } from "@/lib/data";
import { readoutSpring } from "@/lib/motion";

type ChartCopy = {
  title: string;
  x_axis: string;
  y_axis: string;
  cooling_label: string;
  events: readonly { code: string; name: string; time: string; temp: string; note: string }[];
  phases_title: string;
  phases: readonly { name: string; time: string; share: string }[];
  dtr_label: string;
  dtr_definition: string;
};

export type RoastStageProps = {
  chart: ChartCopy;
  dateLine: string;
  imageAlt: string;
  crossings: Crossing[];
  events: ProfileEvent[];
  phases: Phase[];
  bt: number[];
  /** Static SVG layers rendered on the server (strings stay out of this client bundle). */
  layers: { strip: ReactNode; stripLine: ReactNode; profileBase: ReactNode; curve: ReactNode; cooling: ReactNode };
  labels: { time: string; temp: string; A: string; A2: string; tEvent: string; tTime: string; tTemp: string; tNote: string };
};

const T_END = 720;
const T_DROP = 640;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const pct = (t: number) => (t / T_END) * 100;
const yPct = (T: number) => ((220 - T) / 160) * 100;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// ── The score (motion.md RC1–RC10): scroll progress p in 0…1 is the clock. ──
const RC2 = (t: number) => 0.08 + (0.2 * t) / T_END; // tick i shows
const RC3 = (t: number) => 0.18 + (0.22 * t) / T_END; // projection i starts
const headOf = (p: number) => (clamp01((p - 0.3) / 0.42) * T_DROP) / T_END; // RC4: 0 … 640/720
const SEG = [0.78, 0.78 + 0.14 / 3, 0.78 + (0.28 / 3), 0.92]; // RC9 thirds
const FINAL = 0.92; // RC10
/** RC-sm timeline: time (s) → p, so the same score plays once on phones. */
const SM_P = [0, 0.1, 0.3, 0.72, 0.8, 0.92, 1];
const SM_T = [0, 0.4, 1.0, 3.4, 3.8, 4.6, 4.8];

export function RoastStage({ chart, dateLine, imageAlt, crossings, events, phases, bt, layers, labels }: RoastStageProps) {
  const track = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotionSafe();
  const [small, setSmall] = useState(false);

  const p = useMotionValue(0);
  const sp = useSpring(p, readoutSpring);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const inView = useInView(stage, { amount: 0.35, once: true });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setSmall(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // Reduced motion: the fully constructed section, still.
  useEffect(() => {
    if (reduce) {
      p.jump(1);
      sp.jump(1);
    }
  }, [reduce, p, sp]);

  // md+: scroll is the clock.
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!reduce && !small) p.set(v);
  });
  useEffect(() => {
    if (!reduce && !small) p.set(scrollYProgress.get());
  }, [reduce, small, p, scrollYProgress]);

  // sm: no pin; the score plays once as a timeline when the stage comes into view.
  useEffect(() => {
    if (reduce || !small || !inView) return;
    // A plain rAF clock (linear, piecewise): time → p along SM_T / SM_P.
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 1000, SM_T[SM_T.length - 1]);
      let k = 1;
      while (k < SM_T.length - 1 && t > SM_T[k]) k++;
      const f = (t - SM_T[k - 1]) / (SM_T[k] - SM_T[k - 1]);
      p.set(SM_P[k - 1] + (SM_P[k] - SM_P[k - 1]) * Math.min(1, Math.max(0, f)));
      if (t < SM_T[SM_T.length - 1]) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, small, inView, p]);

  // ── Discrete states (time-based transitions once crossed) ──
  const [ticksOn, setTicksOn] = useState(0);
  const [projOn, setProjOn] = useState(0);
  const [eventsOn, setEventsOn] = useState(0);
  const [final, setFinal] = useState(false);
  const index = crossings.filter((c) => c.index);
  // Index-tick labels (lg+), decluttered: none within 4% of either edge (the A / A′ labels sit there)
  // and at least 3% apart, so the dense charge fall doesn't print labels on top of each other.
  const labelled = new Set<number>();
  let lastLeft = -Infinity;
  crossings.forEach((c, i) => {
    if (c.index && c.left >= 4 && c.left <= 96 && c.left - lastLeft >= 3) {
      labelled.add(i);
      lastLeft = c.left;
    }
  });

  const sync = (v: number) => {
    const head = headOf(v) * T_END;
    setTicksOn(crossings.reduce((n, c) => (v >= RC2(c.t) ? n + 1 : n), 0));
    setProjOn(index.reduce((n, c) => (v >= RC3(c.t) ? n + 1 : n), 0));
    setEventsOn(v < 0.3 ? 0 : events.reduce((n, e) => (head >= e.t - 0.5 ? n + 1 : n), 0));
    setFinal(v >= FINAL);
  };
  useMotionValueEvent(p, "change", sync);

  // Narration follows the same spring-smoothed head as the readout, so the line never runs
  // ahead of the numbers (R1-07).
  const [narrOn, setNarrOn] = useState(0);
  const eventsPassed = (v: number) => {
    const head = headOf(v) * T_END;
    return v < 0.3 ? 0 : events.reduce((n, e) => (head >= e.t - 0.5 ? n + 1 : n), 0);
  };
  useMotionValueEvent(sp, "change", (v) => setNarrOn(eventsPassed(v)));

  // ── Continuous marks ──
  const stripClip = useTransform(p, (v) => `inset(0 ${(1 - clamp01(v / 0.1)) * 100}% 0 0)`);
  const aOpacity = useTransform(p, [0, 0.02], [0, 1]);
  const a2Opacity = useTransform(p, [0.09, 0.1], [0, 1]);
  const curveClip = useTransform(p, (v) => `inset(0 ${(1 - headOf(v)) * 100}% 0 0)`);
  const coolStart = (1 - T_DROP / T_END) * 100;
  const coolClip = useTransform(p, (v) => `inset(0 ${coolStart * (1 - clamp01((v - 0.72) / 0.08))}% 0 0)`);
  const coolOpacity = useTransform(p, [0.76, 0.8], [0, 1]);
  const projOpacity = useTransform(p, [0.72, 0.78], [1, 0.35]);
  const cursorOpacity = useTransform(p, [0.28, 0.3], [0, 1]);
  const cursorX = useTransform(sp, (v) => `${headOf(v) * 100}%`);
  const sample = (v: number) => bt[Math.min(T_END, Math.round(headOf(v) * T_END))];
  const dotY = useTransform(sp, (v) => `${yPct(sample(v))}%`);
  const timeText = useTransform(sp, (v) => mmss(headOf(v) * T_END));
  const tempText = useTransform(sp, (v) => `${sample(v).toFixed(1)}°`);
  const seg = [
    useTransform(p, [SEG[0], SEG[1]], [0, 1]),
    useTransform(p, [SEG[1], SEG[2]], [0, 1]),
    useTransform(p, [SEG[2], SEG[3]], [0, 1]),
  ];
  const segLabel = [
    useTransform(p, [SEG[1] - 0.004, SEG[1]], [0, 1]),
    useTransform(p, [SEG[2] - 0.004, SEG[2]], [0, 1]),
    useTransform(p, [SEG[3] - 0.004, SEG[3]], [0, 1]),
  ];

  // Narration: the last event the pen has passed; the DTR definition at the end.
  const narr = final ? -2 : narrOn - 1;
  const drop = chart.events[chart.events.length - 1];
  const dropTemp = `${bt[T_DROP].toFixed(1)}°`;
  const shortLabel = `${chart.title.split(" · ")[0]} · ${dateLine.match(/\d+ \w{3}/)?.[0] ?? ""}`;
  const dataPhases = phases.filter((ph) => ph.pct !== null);
  const cooling = phases.find((ph) => ph.pct === null)!;
  const minuteTicks = Array.from({ length: 13 }, (_, i) => i);
  const yLabels = [200, 160, 120, 80];

  return (
    <figure id="section-a" className="stage-figure" aria-labelledby="stage-title">
      <div ref={track} className="stage-track">
        <div ref={stage} className="stage" data-final={final ? "" : undefined}>
          {/* Row 1: instrument line + readout */}
          <div className="mx-auto grid w-full max-w-page grid-cols-4 gap-x-gutter px-margin md:grid-cols-8 lg:grid-cols-12">
            <p id="stage-title" className="eyebrow col-span-4 self-end text-muted md:col-span-8">
              <span className="hidden md:inline">
                {chart.title} · {dateLine}
              </span>
              <span className="md:hidden">{shortLabel}</span>
            </p>
            <p aria-hidden="true" className="readout col-span-4 md:col-span-8 lg:col-span-4">
              <span className="readout-live" data-hidden={final ? "" : undefined}>
                <span className="text-muted">{labels.time} </span>
                <m.span>{timeText}</m.span>
                <span className="text-muted"> · {labels.temp} </span>
                <m.span>{tempText}</m.span>
              </span>
              <span className="readout-final" data-hidden={final ? undefined : ""}>
                {drop.name} {drop.time} · {dropTemp} <span className="text-muted">· {chart.dtr_label}</span>
              </span>
            </p>
          </div>

          {/* Row 2: narration */}
          <div className="mx-auto grid w-full max-w-page grid-cols-4 gap-x-gutter px-margin md:grid-cols-8 lg:grid-cols-12">
            <p className="narration col-span-4 md:col-span-8 lg:col-span-9" aria-live="off">
              {narr === -2 || reduce ? (
                chart.dtr_definition
              ) : narr >= 0 ? (
                <>
                  <span className="narr-code">{chart.events[narr].code}</span> · {chart.events[narr].note}
                </>
              ) : (
                " "
              )}
            </p>
          </div>

          {/* Row 3: phase bar */}
          <div className="phase-row">
            <div
              className="phase-bar"
              role="img"
              aria-label={`${chart.phases_title}: ${chart.phases.map((ph) => `${ph.name} ${ph.time}, ${ph.share}`).join("; ")}`}
            >
              {dataPhases.map((ph, i) => (
                <div
                  key={ph.id}
                  className={`phase-seg phase-${ph.id}`}
                  style={{ left: `${pct(ph.from)}%`, width: `${pct(ph.to - ph.from)}%` }}
                >
                  <m.span className="phase-fill rc-anim" style={{ scaleX: seg[i] }} />
                  <m.span className="phase-label rc-anim" style={{ opacity: segLabel[i] }}>
                    <span className="hidden lg:inline">
                      {chart.phases[i].name} {chart.phases[i].time} ·{" "}
                    </span>
                    {chart.phases[i].share}
                  </m.span>
                </div>
              ))}
              <m.div
                className="phase-cooling rc-anim"
                style={{ left: `${pct(cooling.from)}%`, opacity: coolOpacity }}
              >
                <span className="phase-cooling-rule" />
                <span className="phase-label hidden text-muted md:block">{chart.cooling_label}</span>
              </m.div>
            </div>
            <p className="eyebrow mt-2 px-margin text-muted lg:hidden" aria-hidden="true">
              {chart.phases_title} · {chart.phases.map((ph) => ph.name).join(" · ")}
            </p>
          </div>

          {/* Row 4: the strip (plan view along A–A′) */}
          <div className="strip" aria-hidden="true">
            {layers.strip}
            <m.div className="layer rc-anim" style={{ clipPath: stripClip }}>
              {layers.stripLine}
            </m.div>
            {crossings.map((c, i) => (
              <span
                key={i}
                className={`tick${c.index ? " is-index" : ""}`}
                data-on={i < ticksOn ? "" : undefined}
                style={{ left: `${c.left}%` }}
              >
                {c.index && (
                  <span className="tick-label num" data-show={labelled.has(i) ? "" : undefined}>
                    {c.T}°
                  </span>
                )}
              </span>
            ))}
            <m.span className="strip-end strip-a rc-anim" style={{ opacity: aOpacity }}>
              {labels.A}
            </m.span>
            <m.span className="strip-end strip-a2 rc-anim" style={{ opacity: a2Opacity }}>
              {labels.A2}
            </m.span>
          </div>

          {/* Row 5: the profile, which is batch 214's roast curve */}
          <div className="profile" role="img" aria-label={imageAlt}>
           <div className="plot">
            {layers.profileBase}
            <m.div className="layer rc-anim" style={{ clipPath: curveClip }} aria-hidden="true">
              {layers.curve}
            </m.div>
            <m.div className="layer rc-anim" style={{ clipPath: coolClip }} aria-hidden="true">
              {layers.cooling}
            </m.div>

            <div aria-hidden="true">
              <m.div className="layer rc-anim" style={{ opacity: projOpacity }}>
                {index.map((c, i) => (
                  <span
                    key={i}
                    className="proj"
                    data-on={i < projOn ? "" : undefined}
                    style={{ left: `${c.left}%`, height: `${yPct(c.T)}%` }}
                  />
                ))}
              </m.div>

              {/* md+: 200/160/120/80 at the right edge. sm: 160 and 120 at the left (R1-04). */}
              {yLabels.map((T) => (
                <span key={T} className={`y-label num${T === 200 || T === 80 ? " hidden md:block" : ""}`} style={{ top: `${yPct(T)}%` }}>
                  {T}°
                </span>
              ))}

              {events.map((e, i) => {
                const c = chart.events[i];
                return (
                  <div
                    key={e.code}
                    className={`wp wp-${e.code.toLowerCase()}`}
                    data-on={i < eventsOn ? "" : undefined}
                    style={{ left: `${e.left}%`, top: `${e.top}%` }}
                  >
                    {e.code === "DROP" ? <span className="wp-summit">{"▲"}</span> : <span className="wp-dot" />}
                    {e.code !== "CHARGE" && <span className="wp-leader" />}
                    <span className="wp-label">
                      <span className="hidden font-semibold md:inline">{c.name}</span>
                      <span className="font-semibold md:hidden">{e.code === "CHARGE" ? "CHG" : e.code}</span>{" "}
                      <span className="num">
                        {c.time}
                        {c.temp ? ` · ${c.temp}` : ""}
                      </span>
                    </span>
                  </div>
                );
              })}

              {/* sm: DROP's label sits in the 20px lane under the strip, with a leader down to the ▲. */}
              {(() => {
                const drop = events[events.length - 1];
                const c = chart.events[events.length - 1];
                return (
                  <div className="drop-lane md:hidden" data-on={eventsOn >= events.length ? "" : undefined}>
                    <span className="drop-lane-leader" style={{ left: `${drop.left}%`, height: `calc(${drop.top}% - 6px)` }} />
                    <span className="drop-lane-label">
                      <span className="font-semibold">{drop.code}</span>{" "}
                      <span className="num">
                        {c.time} · {c.temp}
                      </span>
                    </span>
                  </div>
                );
              })()}

              <m.span className="cool-label hidden rc-anim md:flex" style={{ opacity: coolOpacity }}>
                <span className="cool-rule" />
                {chart.cooling_label}
              </m.span>

              {!reduce && (
                <m.div className="layer" style={{ x: cursorX, y: dotY, opacity: cursorOpacity }}>
                  <span className="cursor-dot" />
                </m.div>
              )}
            </div>
           </div>
          </div>

          {/* Plumb cursor: one ink hairline through strip and profile (RC5) */}
          {!reduce && (
            <div className="cursor-span" aria-hidden="true">
              <m.div className="layer" style={{ x: cursorX, opacity: cursorOpacity }}>
                <span className="cursor-line" />
              </m.div>
            </div>
          )}

          {/* Row 6: time axis */}
          <div className="time-axis" aria-hidden="true">
            <div className="relative h-5">
              {minuteTicks.map((m) => (
                <span
                  key={m}
                  className={`t-tick num${m % 2 ? " hidden md:block" : ""}${m === 0 ? " is-first" : m === 12 ? " is-last" : ""}`}
                  style={{ left: `${pct(m * 60)}%` }}
                >
                  {m}:00
                </span>
              ))}
            </div>
            <div className="mt-2 flex justify-between gap-4 px-2">
              <span className="eyebrow text-muted">{chart.x_axis}</span>
              <span className="eyebrow text-right text-muted">{chart.y_axis}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="sr-only">
      <table>
        <caption>{chart.title}</caption>
        <thead>
          <tr>
            <th scope="col">{labels.tEvent}</th>
            <th scope="col">{labels.tTime}</th>
            <th scope="col">{labels.tTemp}</th>
            <th scope="col">{labels.tNote}</th>
          </tr>
        </thead>
        <tbody>
          {chart.events.map((e) => (
            <tr key={e.code}>
              <th scope="row">{e.name}</th>
              <td>{e.time}</td>
              <td>{e.temp}</td>
              <td>{e.note}</td>
            </tr>
          ))}
          {chart.phases.map((ph) => (
            <tr key={ph.name}>
              <th scope="row">{ph.name}</th>
              <td>{ph.time}</td>
              <td>{ph.share}</td>
              <td />
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </figure>
  );
}

