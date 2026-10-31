"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NorthTick, Arrow } from "./Glyphs";

export type NavCopy = {
  nav: readonly { label: string; href: string }[];
  nav_cta: string;
  nav_label: string;
  menu_open: string;
  menu_close: string;
  wordmark: string;
  homeLabel: string;
};

/** Links are root-relative so they also work from the 404 page. */
const href = (h: string) => `/${h}`;

export function NavBar({ m }: { m: NavCopy }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);

  // N1: the collar gains its hairline once the page has moved.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section: the one crossing the upper middle of the viewport.
  useEffect(() => {
    const ids = m.nav.map((l) => l.href.slice(1));
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        setActive(ids.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [m.nav]);

  // Esc closes the sheet and returns focus to the Menu button.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const closeFromLink = () => {
    setOpen(false);
    menuButton.current?.focus({ preventScroll: true });
  };

  return (
    <header className="nav-bar" data-scrolled={scrolled ? "" : undefined}>
      <nav aria-label={m.nav_label} className="relative h-full">
        <div className="mx-auto flex h-full max-w-page items-center justify-between gap-6 px-margin">
          <Link href="/#top" aria-label={m.homeLabel} className="wordmark">
            <NorthTick className="h-[0.95em] w-auto" />
            <span>{m.wordmark}</span>
          </Link>

          <div className="flex items-center gap-6">
            <ul className="hidden items-center gap-8 lg:flex">
              {m.nav.map((l) => (
                <li key={l.href}>
                  <Link
                    href={href(l.href)}
                    className="nav-link"
                    aria-current={active === l.href.slice(1) ? "true" : undefined}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/#subscribe" className="btn hidden h-10 px-5 md:inline-flex">
              <span>{m.nav_cta}</span>
              <Arrow />
            </Link>
            <button
              ref={menuButton}
              type="button"
              className="menu-button lg:hidden"
              aria-expanded={open}
              aria-controls="menu"
              onClick={() => setOpen((o) => !o)}
            >
              {open ? m.menu_close : m.menu_open}
            </button>
          </div>
        </div>

        <div id="menu" className="menu-sheet lg:hidden" hidden={!open}>
          <ul>
            {m.nav.map((l) => (
              <li key={l.href}>
                <Link
                  href={href(l.href)}
                  onClick={closeFromLink}
                  aria-current={active === l.href.slice(1) ? "true" : undefined}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="p-4 md:hidden">
            <Link href="/#subscribe" onClick={closeFromLink} className="btn flex h-13 w-full justify-between px-6">
              <span>{m.nav_cta}</span>
              <Arrow />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
