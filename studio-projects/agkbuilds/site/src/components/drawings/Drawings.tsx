import { balloon, heroConstruction, processPlate } from "@/assets/drawings";

// Inline drawings from studio/design/assets (via scripts/sync-assets.mjs). Server components:
// the markup is in the HTML, they add nothing to the client bundle and follow the colour tokens.
// All are decorative (aria-hidden, focusable=false in the files themselves).

/** Adds style="--k:n" to every path[pathLength] inside each `<g id=…>` listed, n counting from 0
 *  per group, so CSS can stagger the draws (motion H3c, P1). */
function indexPaths(svg: string, groupIds: string[]) {
  let out = svg;
  for (const id of groupIds) {
    const start = out.indexOf(`id="${id}"`);
    if (start < 0) continue;
    const open = out.lastIndexOf("<g", start);
    // find the matching </g>
    let depth = 0;
    let end = -1;
    const re = /<g[\s>]|<\/g>/g;
    re.lastIndex = open;
    for (let m = re.exec(out); m; m = re.exec(out)) {
      depth += m[0] === "</g>" ? -1 : 1;
      if (depth === 0) {
        end = m.index;
        break;
      }
    }
    if (end < 0) continue;
    let k = 0;
    const group = out.slice(open, end).replace(/<path pathLength="1"/g, () => `<path style="--k:${k++}" pathLength="1"`);
    out = out.slice(0, open) + group + out.slice(end);
  }
  return out;
}

const heroSvg = indexPaths(heroConstruction, ["hc-ticks"]);
const plateSvg = indexPaths(processPlate, ["pl-1", "pl-2", "pl-3"]);

export function HeroConstruction({ className }: { className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: heroSvg }} />;
}

export function ProcessPlate({ className }: { className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: plateSvg }} />;
}

export function BalloonCircle() {
  return <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: balloon }} />;
}
