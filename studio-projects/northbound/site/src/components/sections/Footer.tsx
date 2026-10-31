import Link from "next/link";
import { copy } from "@/content/copy";
import { Emph } from "@/lib/text";
import { NorthTick } from "@/components/ui/Glyphs";

const ft = copy.footer;
const m = copy.microcopy;

/** The map collar: sheet-margin line, then the wide wordmark. */
export function Footer() {
  return (
    <footer className="border-t border-ink pt-section-sm pb-10">
      <div className="mx-auto max-w-page px-margin">
        <p className="eyebrow border-b border-line pb-4 text-muted">{ft.map_credit}</p>

        <div className="mt-10 grid grid-cols-4 gap-x-gutter gap-y-6 md:grid-cols-8 lg:grid-cols-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-9">
            <Link href="/#top" className="footer-wordmark">
              <NorthTick className="h-[0.8em] w-auto shrink-0" />
              <span>{ft.wordmark}</span>
            </Link>
            <p className="mt-3 text-lg text-ink-soft">
              <Emph text={ft.tagline} />
            </p>
          </div>
          <p className="width-map num col-span-4 text-sm font-medium md:col-span-8 lg:col-span-3 lg:self-end lg:text-right">
            {ft.coordinates}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-4 gap-x-gutter gap-y-8 md:grid-cols-8 lg:grid-cols-12">
          <div className="col-span-4 lg:col-span-3">
            <p className="eyebrow text-muted">{ft.location_label}</p>
            <p className="mt-2 text-sm text-ink-soft">{ft.location}</p>
          </div>
          <div className="col-span-4 lg:col-span-3">
            <p className="eyebrow text-muted" aria-hidden="true">
              {" "}
            </p>
            <p className="mt-2 text-sm text-ink-soft">{ft.schedule}</p>
          </div>
          <div className="col-span-4 lg:col-span-3">
            <p className="eyebrow text-muted">{ft.contact_label}</p>
            <p className="mt-2 text-sm">
              <a className="footer-link" href={`mailto:${ft.email}`}>
                {ft.email}
              </a>
            </p>
          </div>
          <div className="col-span-4 lg:col-span-3">
            <p className="eyebrow text-muted" aria-hidden="true">
              {" "}
            </p>
            <ul className="flex flex-col">
              {m.nav.map((l) => (
                <li key={l.href}>
                  <Link className="footer-link inline-flex min-h-11 items-center text-sm" href={`/${l.href}`}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-line pt-4 text-xs text-muted md:flex-row md:justify-between">
          <p>{m.footer.legal}</p>
          <p>{ft.demo_note}</p>
        </div>
      </div>
    </footer>
  );
}
