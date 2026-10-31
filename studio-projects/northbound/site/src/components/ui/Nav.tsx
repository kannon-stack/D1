import { copy, specCopy } from "@/content/copy";
import { NavBar } from "./NavBar";

const m = copy.microcopy;

/** Server shell: hands the client nav only the strings it needs. */
export function Nav() {
  return (
    <NavBar
      m={{
        nav: m.nav,
        nav_cta: m.nav_cta,
        nav_label: m.nav_label,
        menu_open: m.menu_open,
        menu_close: m.menu_close,
        wordmark: copy.footer.wordmark,
        homeLabel: specCopy.homeLabel,
      }}
    />
  );
}
