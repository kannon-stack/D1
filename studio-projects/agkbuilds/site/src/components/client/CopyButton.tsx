"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { copy } from "@/content/copy";

const c = copy.contact;
const noop = () => () => {};

/** Writes a message into the section's polite live region (re-announces repeats). */
function announce(regionId: string, message: string) {
  const region = document.getElementById(regionId);
  if (!region) return;
  region.textContent = "";
  window.setTimeout(() => {
    region.textContent = message;
  }, 50);
}

/** Selects the value's text so ⌘C / Ctrl+C works when the clipboard API can't be used. */
function selectText(id: string) {
  const el = document.getElementById(id);
  const sel = window.getSelection();
  if (!el || !sel) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  sel.removeAllRanges();
  sel.addRange(range);
}

/**
 * The copy button (layout-spec contact, motion U3). Rendered only after mount, so without JS
 * the cells show just the values. Success: "Copied" in accent for 2400 ms and a polite
 * announcement. Failure: the value is selected and contact.copy_failed shows for 4000 ms.
 */
export function CopyButton({
  kind,
  valueId,
  regionId,
}: {
  kind: "email" | "phone";
  valueId: string;
  regionId: string;
}) {
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!mounted) return null;

  const value = kind === "email" ? c.email : c.phone;

  async function onClick() {
    window.clearTimeout(timer.current);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("no clipboard");
      await navigator.clipboard.writeText(value);
      setState("copied");
      announce(regionId, kind === "email" ? c.copied_email_announce : c.copied_phone_announce);
      timer.current = window.setTimeout(() => setState("idle"), 2400);
    } catch {
      selectText(valueId);
      setState("failed");
      announce(regionId, c.copy_failed);
      timer.current = window.setTimeout(() => setState("idle"), 4000);
    }
  }

  return (
    <>
      <button
        type="button"
        className="copy-btn annotate"
        data-state={state}
        aria-label={kind === "email" ? c.copy_email_aria : c.copy_phone_aria}
        aria-describedby={valueId}
        onClick={onClick}
      >
        {state === "copied" ? c.copied : c.copy}
      </button>
      {state === "failed" && <p className="annotate basis-full text-ink">{c.copy_failed}</p>}
    </>
  );
}
