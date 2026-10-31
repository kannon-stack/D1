"use client";

import { AnimatePresence, useInView } from "motion/react";
import * as m from "motion/react-m";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { useRef, useState } from "react";
import { CadenceControl } from "@/components/ui/CadenceControl";
import { useCadence } from "@/lib/cadence-store";
import { deliveryWeeks, fmt, startsMonth, weeks, WEEKS, type Week } from "@/lib/schedule";
import { fill } from "@/lib/text";
import { duration, ease } from "@/lib/motion";

export type RouteCopy = {
  region_label: string;
  cadence_legend: string;
  cadence_options: readonly { value: number; label: string }[];
  instructions: string;
  keyboard_hint: string;
  window_label: string;
  legend: { roast: string; door: string; skipped: string };
  stop_label: string;
  stop_roast: string;
  stop_door: string;
  stop_cutoff: string;
  skip_button: string;
  skip_aria: string;
  restore_button: string;
  restore_aria: string;
  skipped_label: string;
  skipped_note: string;
  restored_note: string;
  locked_label: string;
  locked_note: string;
  holiday_note: string;
  summary: string;
  summary_one: string;
  empty_title: string;
  empty_body: string;
  empty_action: string;
  announce_cadence: string;
  announce_skipped: string;
  announce_restored: string;
  announce_paused: string;
};

type LastAction = { k: number; type: "skip" | "restore" } | null;

const station = (k: number) => `${((k + 0.5) / WEEKS) * 100}%`;
const doorShort = (w: Week) => (w.holiday ? `${fmt.short(w.door)}*` : fmt.short(w.door));

export function RouteSchedule({ copy: c, cta }: { copy: RouteCopy; cta: string }) {
  const cadence = useCadence();
  const reduce = useReducedMotionSafe();
  const routeRef = useRef<HTMLDivElement>(null);
  const inView = useInView(routeRef, { once: true, amount: 0.4 });
  const revealed = !!reduce || inView;

  const [skipped, setSkipped] = useState<Set<number>>(() => new Set());
  const [skipCadence, setSkipCadence] = useState(cadence);
  const [focusK, setFocusK] = useState<number | null>(null);
  const [last, setLast] = useState<LastAction>(null);
  const [announce, setAnnounce] = useState("");

  // Changing cadence clears every skip (derived during render, no effect needed).
  const skips = skipCadence === cadence ? skipped : new Set<number>();
  if (skipCadence !== cadence) {
    setSkipCadence(cadence);
    setSkipped(new Set());
    setLast(null);
  }

  const stops = deliveryWeeks(cadence);
  const active = stops.filter((w) => !skips.has(w.k));
  const next = active[0];
  const cadenceLabel = c.cadence_options.find((o) => o.value === cadence)?.label ?? "";
  const empty = active.length === 0;

  const summary = empty
    ? ""
    : active.length === 1
      ? fill(c.summary_one, { weeks: WEEKS, roast: fmt.long(next.roast) })
      : fill(c.summary, { count: active.length, weeks: WEEKS, roast: fmt.long(next.roast) });

  const nextAfter = (k: number) => active.find((w) => w.k > k) ?? active[0];
  const stopDetail = (w: Week) => {
    const n = stops.indexOf(w) + 1;
    const parts = [
      fill(c.stop_label, { n }),
      fill(c.stop_roast, { roast: fmt.long(w.roast) }),
      fill(c.stop_door, { door: fmt.long(w.door) }),
      fill(c.stop_cutoff, { cutoff: fmt.cutoff(w.cutoff) }),
    ].join(" · ");
    if (w.locked) return `${parts}. ${c.locked_note}`;
    return w.holiday ? `${parts}. ${c.holiday_note}` : parts;
  };

  let detail = "";
  const focused = focusK !== null ? stops.find((w) => w.k === focusK) : undefined;
  if (last && (focusK === null || focusK === last.k)) {
    const w = weeks[last.k];
    detail =
      last.type === "skip"
        ? next
          ? fill(c.skipped_note, { next_roast: fmt.long(nextAfter(w.k).roast) })
          : ""
        : fill(c.restored_note, { roast: fmt.long(w.roast), door: fmt.long(w.door) });
  } else if (focused) {
    detail = skips.has(focused.k) ? c.skipped_label : stopDetail(focused);
  } else if (next) {
    detail = stopDetail(next);
  }

  const toggle = (w: Week) => {
    if (w.locked) return;
    const s = new Set(skips);
    const skipping = !s.has(w.k);
    if (skipping) s.add(w.k);
    else s.delete(w.k);
    setSkipped(s);
    setLast({ k: w.k, type: skipping ? "skip" : "restore" });
    const remaining = stops.filter((x) => !s.has(x.k));
    if (remaining.length === 0) setAnnounce(c.announce_paused);
    else if (skipping) {
      const nx = remaining.find((x) => x.k > w.k) ?? remaining[0];
      setAnnounce(fill(c.announce_skipped, { roast: fmt.long(w.roast), next_roast: fmt.long(nx.roast) }));
    } else setAnnounce(fill(c.announce_restored, { roast: fmt.long(w.roast) }));
  };

  const restoreAll = () => {
    setSkipped(new Set());
    setLast(null);
    setAnnounce(fill(c.announce_cadence, { cadence: cadenceLabel, count: stops.length, weeks: WEEKS }));
  };

  const onCadence = (v: number) => {
    const label = c.cadence_options.find((o) => o.value === v)?.label ?? "";
    setAnnounce(fill(c.announce_cadence, { cadence: label, count: deliveryWeeks(v).length, weeks: WEEKS }));
  };

  const fast = reduce ? { duration: 0 } : { duration: duration.fast, ease: ease.pin };
  const pinT = (i: number) => (reduce ? { duration: 0 } : { duration: duration.base, ease: ease.pin, delay: i * 0.04 });
  const exitT = reduce ? { duration: 0 } : { duration: duration.fast * 0.8, ease: "easeIn" as const };

  return (
    <>
      <p className="eyebrow text-ink" id="route-region-label">
        {c.region_label}
      </p>
      <p id="route-hint" className="sr-only">
        {c.keyboard_hint}
      </p>

      <p id="route-cadence-legend" className="eyebrow mt-6 mb-3 text-muted">
        {c.cadence_legend}
      </p>
      <CadenceControl options={c.cadence_options} labelledBy="route-cadence-legend" onChange={onCadence} />

      <p className="eyebrow mt-6 text-muted">{c.window_label}</p>

      {/* md+: horizontal survey route over 12 weeks of chainage */}
      <div ref={routeRef} className="route-h hidden md:block" data-empty={empty ? "" : undefined} data-on={revealed ? "" : undefined}>
        <span className="route-line" style={{ left: station(0), right: `calc(100% - ${station(WEEKS - 1)})` }} />
        <span className="route-base" />
        {weeks.map((w) => (
          <span key={w.k} className="route-station num" style={{ left: station(w.k) }}>
            <span className="route-tick" />
            <span className="route-day">{fmt.day(w.roast)}</span>
            {startsMonth(w.k) && <span className="route-month">{fmt.month(w.roast)}</span>}
          </span>
        ))}
        <AnimatePresence initial={false}>
          <m.div key={cadence} className="absolute inset-0" exit={{ opacity: 0, y: -6, transition: exitT }}>
            {stops.map((w, i) => {
              const isSkipped = skips.has(w.k);
              return (
                <m.div
                  key={w.k}
                  className="waypoint"
                  style={{ left: station(w.k) }}
                  initial={{ opacity: 0, y: -8 }}
                  animate={revealed ? { opacity: 1, y: 0 } : undefined}
                  transition={pinT(i)}
                  data-skipped={isSkipped ? "" : undefined}
                >
                  <span className="wp-date num" aria-hidden="true">
                    <span className="wp-date-text">{doorShort(w)}</span>
                    <span className="wp-strike" />
                  </span>
                  {isSkipped && (
                    <span className="wp-skipped" aria-hidden="true">
                      {c.skipped_label}
                    </span>
                  )}
                  {w.locked && (
                    <span className="wp-skipped" aria-hidden="true">
                      {c.locked_label}
                    </span>
                  )}
                  <button
                    type="button"
                    className="pin"
                    aria-pressed={isSkipped}
                    aria-disabled={w.locked || undefined}
                    aria-describedby="route-hint"
                    aria-label={fill(isSkipped ? c.restore_aria : c.skip_aria, { roast: fmt.long(w.roast) })}
                    onClick={() => toggle(w)}
                    onFocus={() => setFocusK(w.k)}
                    onBlur={() => setFocusK(null)}
                    onMouseEnter={() => setFocusK(w.k)}
                    onMouseLeave={() => setFocusK(null)}
                  >
                    <span className="pin-dot" />
                  </button>
                </m.div>
              );
            })}
          </m.div>
        </AnimatePresence>
      </div>

      {/* sm: the route turns vertical, one row per week */}
      <ol className="route-v md:hidden" data-empty={empty ? "" : undefined}>
        {weeks.map((w) => {
          const isStop = w.k % cadence === 0;
          const isSkipped = skips.has(w.k);
          return (
            <li key={w.k} className="route-row" data-stop={isStop ? "" : undefined} data-skipped={isSkipped ? "" : undefined}>
              <span className="route-row-date num">{startsMonth(w.k) ? fmt.long(w.roast) : fmt.short(w.roast)}</span>
              <span className="route-row-line" aria-hidden="true">
                {isStop && <span className="pin-dot" />}
              </span>
              {isStop && (
                <span className="route-row-body">
                  <span className="text-sm">
                    <span className="route-row-door num">{fill(c.stop_door, { door: fmt.long(w.door) })}</span>
                    {isSkipped && <span className="block text-xs text-muted">{c.skipped_label}</span>}
                    {w.holiday && !isSkipped && <span className="block text-xs text-muted">{c.holiday_note}</span>}
                  </span>
                  <button
                    type="button"
                    className="row-toggle"
                    aria-label={fill(isSkipped ? c.restore_aria : c.skip_aria, { roast: fmt.long(w.roast) })}
                    disabled={w.locked}
                    onClick={() => toggle(w)}
                  >
                    {w.locked ? c.locked_label : isSkipped ? c.restore_button : c.skip_button}
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <ul className="route-legend" aria-hidden="true">
        <li>
          <span className="key-tick" />
          {c.legend.roast}
        </li>
        <li>
          <span className="key-pin" />
          {c.legend.door}
        </li>
        <li>
          <span className="key-pin is-hollow" />
          {c.legend.skipped}
        </li>
      </ul>
      {/* R1-08: explain the asterisk whenever a visible stop is shifted for the holiday. */}
      {stops.some((w) => w.holiday) && (
        <p className="mt-2 hidden text-xs text-muted md:block">
          <span aria-hidden="true">* </span>
          {c.holiday_note}
        </p>
      )}

      <div className="mt-5 border-t border-line pt-5">
        {empty ? (
          <div>
            <p className="font-display width-wide text-xl font-normal">{c.empty_title}</p>
            <p className="mt-2 max-w-prose text-base text-ink-soft">{c.empty_body}</p>
            <button type="button" className="tlink mt-3 text-sm font-semibold" onClick={restoreAll}>
              {c.empty_action}
            </button>
          </div>
        ) : (
          <>
            <p className="relative text-lg">
              <AnimatePresence mode="popLayout" initial={false}>
                <m.span
                  key={summary}
                  className="num block"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={fast}
                >
                  {summary}
                </m.span>
              </AnimatePresence>
            </p>
            <p className="width-map num mt-1 hidden min-h-[1.5em] text-sm font-medium text-ink-soft md:block">
              <AnimatePresence mode="popLayout" initial={false}>
                <m.span
                  key={detail}
                  className="block"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={fast}
                >
                  {detail}
                </m.span>
              </AnimatePresence>
            </p>
          </>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-narrow text-sm text-ink-soft">{c.instructions}</p>
        <a href="#subscribe" className="btn inline-flex h-11 shrink-0 justify-between px-5">
          <span>{cta}</span>
          <span aria-hidden="true" className="arrow">
            {"→"}
          </span>
        </a>
      </div>
    </>
  );
}
