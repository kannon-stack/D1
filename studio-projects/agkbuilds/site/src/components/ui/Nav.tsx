import { copy } from "@/content/copy";
import { sheetNo } from "@/lib/data";
import { Wordmark } from "./Wordmark";

const targets = ["build", "process", "contact"] as const;

/**
 * Static nav (decisions #14): wordmark left, the sheet index right (lg+); below lg only
 * "04 Contact ↓". `base` is "" on the home page and "/" elsewhere (the 404), so the anchors
 * stay same-document links on the page itself.
 */
export function Nav({ base = "" }: { base?: string }) {
  const m = copy.microcopy;
  return (
    <header className="site-layer">
      <div className="wrap">
        <nav
          aria-label={m.nav_label}
          className="flex h-14 items-center justify-between border-b border-line lg:h-18"
        >
          <Wordmark variant="nav" href={`${base}#top`} />
          <ul className="flex items-center gap-8">
            {targets.map((id, i) => {
              const last = i === targets.length - 1;
              return (
                <li key={id} className={last ? "" : "hidden lg:block"}>
                  <a href={`${base}#${id}`} className="nav-link annotate min-w-11 justify-end">
                    {sheetNo(id)} {m.nav[i]}
                    {last && (
                      <span aria-hidden="true" className="lg:hidden">
                        &nbsp;↓
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
