"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion";
import { useRef, useState, type FormEvent } from "react";
import { CadenceControl } from "@/components/ui/CadenceControl";
import { useCadence } from "@/lib/cadence-store";
import { fill } from "@/lib/text";
import { duration, ease } from "@/lib/motion";

type Plan = { name: string; price: string; price_unit: string; per_bag: string; fit: string; default?: boolean };
type Style = { value: string; label: string; body: string; default?: boolean };

export type SubscribeCopy = {
  title: string;
  plans_legend: string;
  plans: readonly Plan[];
  bag_note: string;
  selected_label: string;
  cadence_legend: string;
  cadence_options: readonly { value: number; label: string }[];
  style_legend: string;
  styles: readonly Style[];
  plan_summary_label: string;
  plan_summary: string;
};

export type FormCopy = {
  email_label: string;
  email_placeholder: string;
  email_help: string;
  email_error_empty: string;
  email_error_invalid: string;
  submit: string;
  submitting: string;
  success_title: string;
  success: string;
  error_submit: string;
  retry: string;
  demo_note: string;
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
type Status = "idle" | "loading" | "error" | "success";

export function SubscribeForm({ s, f }: { s: SubscribeCopy; f: FormCopy }) {
  const reduce = useReducedMotionSafe();
  const cadence = useCadence();
  const [plan, setPlan] = useState(() => Math.max(0, s.plans.findIndex((p) => p.default)));
  const [style, setStyle] = useState(() => s.styles.find((x) => x.default)?.value ?? s.styles[0].value);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<"" | "empty" | "invalid">("");
  const [status, setStatus] = useState<Status>("idle");
  const emailRef = useRef<HTMLInputElement>(null);

  const chosenPlan = s.plans[plan];
  const chosenStyle = s.styles.find((x) => x.value === style)!;
  const cadenceLabel = s.cadence_options.find((o) => o.value === cadence)?.label ?? "";
  const summary = fill(s.plan_summary, {
    bags: chosenPlan.name,
    cadence: cadenceLabel,
    style: chosenStyle.label.toLowerCase(),
    price: chosenPlan.price,
  });

  const validate = (v: string) => (v.trim() === "" ? "empty" : EMAIL.test(v.trim()) ? "" : "invalid");

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    if (status === "loading") return;
    const err = validate(email);
    setError(err);
    if (err) {
      emailRef.current?.focus();
      return;
    }
    setStatus("loading");
    const fail = new URLSearchParams(window.location.search).has("fail");
    window.setTimeout(() => setStatus(fail ? "error" : "success"), 900);
  };

  const loading = status === "loading";
  const describedBy = error ? "email-error" : "email-help";
  const out = reduce ? { duration: 0 } : { duration: duration.fast * 0.8, ease: "easeIn" as const };
  const inT = reduce ? { duration: 0 } : { duration: duration.base, ease: ease.pin };

  return (
    <div className="form-panel">
      <AnimatePresence mode="wait" initial={false}>
        {status === "success" ? (
          <m.div key="success" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={inT}>
            <m.span
              className="block text-sm text-accent"
              aria-hidden="true"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reduce ? { duration: 0 } : { ...inT, delay: 0.35 }}
            >
              {"▲"}
            </m.span>
            <h3 ref={(el) => el?.focus({ preventScroll: true })} tabIndex={-1} className="mt-3 font-display width-wide text-2xl font-normal">
              {f.success_title}
            </h3>
            <p className="mt-4 max-w-prose text-base text-ink-soft">{fill(f.success, { email: email.trim() })}</p>
            <dl className="mt-6 border-t border-line pt-4">
              <dt className="eyebrow text-muted">{s.plan_summary_label}</dt>
              <dd className="num mt-1 text-base">{summary}</dd>
            </dl>
          </m.div>
        ) : (
          <m.form
            key="form"
            noValidate
            aria-label={s.title}
            onSubmit={submit}
            exit={{ opacity: 0, transition: out }}
            className="flex flex-col gap-7"
          >
            <fieldset disabled={loading}>
              <legend className="eyebrow mb-3 text-muted">{s.plans_legend}</legend>
              <div className="plan-grid">
                {s.plans.map((p, i) => (
                  <label key={p.name} className={`radio-card plan-card${p.default ? " is-default" : ""}`}>
                    <input
                      type="radio"
                      name="plan"
                      value={p.name}
                      checked={plan === i}
                      onChange={() => setPlan(i)}
                      className="sr-only"
                    />
                    <span className="summit" aria-hidden="true">
                      {"▲"}
                    </span>
                    {plan === i && <span className="sr-only">{s.selected_label}</span>}
                    <span className="plan-name text-base font-semibold">{p.name}</span>
                    <span className="plan-price font-display width-wide num text-3xl">{p.price}</span>
                    <span className="plan-unit text-xs text-muted">{p.price_unit}</span>
                    <span className="plan-per width-map num text-xs">{p.per_bag}</span>
                    <span className="plan-fit text-xs text-muted">{p.fit}</span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">{s.bag_note}</p>
            </fieldset>

            <fieldset disabled={loading}>
              <legend id="form-cadence-legend" className="eyebrow mb-3 text-muted">
                {s.cadence_legend}
              </legend>
              <CadenceControl options={s.cadence_options} labelledBy="form-cadence-legend" disabled={loading} />
              <input type="hidden" name="cadence" value={cadence} />
            </fieldset>

            <fieldset disabled={loading}>
              <legend className="eyebrow mb-3 text-muted">{s.style_legend}</legend>
              <div className="grid grid-cols-2 gap-3">
                {s.styles.map((x) => (
                  <label key={x.value} className="radio-card style-card">
                    <input
                      type="radio"
                      name="style"
                      value={x.value}
                      checked={style === x.value}
                      onChange={() => setStyle(x.value)}
                      className="sr-only"
                    />
                    <span className="summit" aria-hidden="true">
                      {"▲"}
                    </span>
                    {style === x.value && <span className="sr-only">{s.selected_label}</span>}
                    <span className="text-base font-semibold">{x.label}</span>
                    <span className="hidden text-sm text-muted md:block">{x.body}</span>
                  </label>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted md:hidden">{chosenStyle.body}</p>
            </fieldset>

            <output className="block border-t border-line pt-4" aria-live="polite">
              <span className="eyebrow block text-muted">{s.plan_summary_label}</span>
              <span className="relative mt-1 block">
                <AnimatePresence mode="popLayout" initial={false}>
                  <m.span
                    key={summary}
                    className="num block text-base"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={reduce ? { duration: 0 } : { duration: duration.fast, ease: ease.pin }}
                  >
                    {summary}
                  </m.span>
                </AnimatePresence>
              </span>
            </output>

            <div>
              <label htmlFor="email" className="text-sm font-semibold">
                {f.email_label}
              </label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder={f.email_placeholder}
                value={email}
                disabled={loading}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error && !validate(e.target.value)) setError("");
                }}
                className="email-input mt-2"
              />
              {error ? (
                <p id="email-error" className="mt-2 text-sm font-medium text-danger">
                  {error === "empty" ? f.email_error_empty : f.email_error_invalid}
                </p>
              ) : (
                <p id="email-help" className="mt-2 text-sm text-muted">
                  {f.email_help}
                </p>
              )}
            </div>

            <div>
              {status === "error" && (
                <div className="mb-4 border border-danger p-4" role="alert">
                  <p className="text-sm text-ink">{f.error_submit}</p>
                  <button type="button" className="tlink mt-2 text-sm font-semibold" onClick={() => submit()}>
                    {f.retry}
                  </button>
                </div>
              )}
              <button type="submit" className="btn submit-btn flex h-14 w-full justify-between px-6" aria-busy={loading || undefined} data-loading={loading ? "" : undefined}>
                <span>{loading ? f.submitting : f.submit}</span>
                <span aria-hidden="true" className="arrow">
                  {"→"}
                </span>
                <span className="submit-line" aria-hidden="true" />
              </button>
              <p className="mt-3 text-xs text-muted">{f.demo_note}</p>
            </div>
          </m.form>
        )}
      </AnimatePresence>
    </div>
  );
}
