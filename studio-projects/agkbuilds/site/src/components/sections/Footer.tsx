import { copy } from "@/content/copy";
import { mailtoHref, telHref, year } from "@/lib/data";
import { Wordmark } from "@/components/ui/Wordmark";

/** Closes the sheet: who, how to reach them, back to the top. `base` as in Nav. */
export function Footer({ base = "" }: { base?: string }) {
  const f = copy.footer;
  const c = copy.contact;
  const lineLink = "text-link inline-flex min-h-11 items-center font-mono text-sm font-medium md:min-h-8";
  return (
    <footer className="site-layer">
      <div className="wrap">
        <div className="grid grid-cols-4 gap-x-gutter gap-y-6 border-t border-line pt-10 pb-8 md:grid-cols-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
          <div className="col-span-2 row-start-1 md:col-span-3 lg:row-span-2">
            <Wordmark variant="footer" href={`${base}#top`} />
          </div>

          <p className="col-span-4 row-start-2 max-w-[22rem] text-sm text-ink-soft md:col-span-5 md:col-start-4 md:row-start-1 lg:col-span-4 lg:row-span-2">
            {f.tagline}
          </p>

          <div className="col-span-4 row-start-3 flex flex-col items-start md:row-span-2 md:row-start-2 lg:col-span-3 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            <p className="text-sm font-semibold text-ink">{f.person}</p>
            <a href={mailtoHref} className={lineLink}>
              {c.email}
            </a>
            <a href={telHref} className={`${lineLink} tabular-nums`}>
              {c.phone}
            </a>
          </div>

          <p className="annotate col-span-4 row-start-4 text-muted md:col-span-4 md:col-start-5 md:row-start-2 md:text-right lg:col-span-2 lg:col-start-11 lg:row-start-1">
            © {year} {f.copyright}
          </p>

          <div className="col-span-2 col-start-3 row-start-1 justify-self-end md:col-span-4 md:col-start-5 md:row-start-3 lg:col-span-2 lg:col-start-11 lg:row-start-2 lg:self-start">
            <a href={`${base}#top`} className="nav-link annotate text-ink">
              {f.back_to_top}
              <span aria-hidden="true">&nbsp;↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
