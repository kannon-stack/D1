import type { CSSProperties } from "react";
import { copy, specCopy } from "@/content/copy";
import { terrainHeroInner } from "@/assets/terrain";
import { miniInner } from "@/assets/minis";
import { data } from "@/lib/data";
import { Emph } from "@/lib/text";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import { Arrow } from "@/components/ui/Glyphs";

const h = copy.hero;
const { sectionLine, spots } = data.hero;

/** H2: each mark pins as the H1 wipe (300ms delay, 1400ms) passes it. */
const passDelay = (left: number) =>
  Math.round(
    300 +
      (1400 * (left - sectionLine.A.left)) /
        (sectionLine.A2.left - sectionLine.A.left),
  );

const at = (left: number, top: number, delay?: number) =>
  ({
    left: `${left}%`,
    top: `${top}%`,
    ...(delay !== undefined ? { animationDelay: `${delay}ms` } : {}),
  }) as CSSProperties;

/** The survey map: static land, with only the section line and spot heights animated (CSS, at first paint). */
function Terrain({ label }: { label: string }) {
  return (
    <div className="terrain" role="img" aria-label={label}>
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        focusable="false"
        dangerouslySetInnerHTML={{ __html: terrainHeroInner }}
      />
      <style>
        {spots
          .map(
            (s, i) =>
              `.hero #nb-spots > :nth-child(${i + 1}){animation-delay:${passDelay(s.left)}ms}`,
          )
          .join("")}
      </style>
      <div aria-hidden="true">
        <span
          className="sec-label survey-pin"
          style={at(
            sectionLine.A.left,
            sectionLine.A.top,
            passDelay(sectionLine.A.left),
          )}
        >
          {specCopy.sectionA}
        </span>
        <span
          className="sec-label survey-pin"
          style={at(
            sectionLine.A2.left,
            sectionLine.A2.top,
            passDelay(sectionLine.A2.left),
          )}
        >
          {specCopy.sectionA2}
        </span>
        {spots.map((s) => (
          <span
            key={s.code}
            className={`spot-label survey-pin num${s.code === "DROP" ? " is-summit" : ""}`}
            style={at(s.left, s.top, passDelay(s.left))}
          >
            {s.code === "DROP" && <span className="text-accent">{"▲ "}</span>}
            {`${s.T}°`}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Hero() {
  const [line1, line2, coda] = h.headline.split("\n");
  const batchNo = h.route_card.batch.replace(/\D/g, "");
  const drop = data.minis.find((mi) => mi.batch === 214)!.drop;

  return (
    <section id="top" aria-labelledby="hero-title" className="hero">
      <div className="hero-copy">
        <h1 id="hero-title" className="hero-h1">
          <span className="hero-display">
            <span className="block">
              <Emph text={line1} />{" "}
            </span>
            <span className="block">
              <Emph text={line2} />
            </span>
          </span>
          <span className="hero-coda">
            {" "}
            <Emph text={coda} />
          </span>
        </h1>
        <p className="hero-sub">{h.subhead}</p>
        <div className="hero-ctas">
          <ButtonLink href="#subscribe" className="hero-cta">
            {h.cta}
          </ButtonLink>
          <TextLink href="#roasts" arrow="down" className="text-sm font-medium">
            {h.secondary_cta}
          </TextLink>
          <p className="mt-0.5 max-w-narrow text-sm text-muted">
            {h.reassurance}
          </p>
        </div>
      </div>

      <div className="terrain-window">
        <Terrain label={h.image_alt} />
      </div>

      <aside className="route-card" aria-labelledby="route-card-label">
        <p id="route-card-label" className="eyebrow text-ink">
          {h.route_card.label}
        </p>
        <p className="route-card-batch">
          <span className="sr-only">{h.route_card.batch}</span>
          <span
            aria-hidden="true"
            className="font-display width-wide num font-light"
          >
            {batchNo}
          </span>
        </p>
        <p className="route-card-origin">{h.route_card.origin}</p>
        <div className="route-card-mini">
          <div className="mini-box hero-plot relative h-full">
            <svg
              viewBox="0 0 720 160"
              preserveAspectRatio="none"
              aria-hidden="true"
              focusable="false"
              dangerouslySetInnerHTML={{ __html: miniInner[214] }}
            />
            <span
              className="drop-dot"
              style={at(drop.left, drop.top)}
              aria-hidden="true"
            />
          </div>
        </div>
        <div className="route-card-data">
          <p className="data-line">{h.route_card.roasted}</p>
          <p className="data-line">
            {h.route_card.drop} · {h.route_card.dtr}
          </p>
          <p className="mt-3">
            <TextLink
              href="#roast-curve"
              arrow="down"
              className="text-sm font-medium"
            >
              {h.route_card.link}
            </TextLink>
          </p>
        </div>
      </aside>

      <p className="hero-legend">
        <span className="block">{h.eyebrow}</span>
        <span className="block">
          {h.legend} <Arrow dir="down" />
        </span>
      </p>
    </section>
  );
}
