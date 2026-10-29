#!/usr/bin/env node
// Accessibility + performance audit for a running site: axe at mobile/desktop in
// light and dark, a keyboard tab-walk, a tap-target scan, a structure check and
// Lighthouse (mobile). Writes raw JSON/HTML plus summary.json and summary.md.
//
// Usage:
//   node .claude/studio-tools/scripts/audit.mjs --url http://localhost:3100 --out <dir>
//     [--no-lighthouse] [--lh-runs 3]   (Lighthouse reports the median of N runs)
import fs from "node:fs";
import path from "node:path";
import {
  parseArgs,
  loadPlaywright,
  launchBrowser,
  ensureDir,
  writeJson,
  viewportFor,
  revealAll,
  gotoAndSettle,
  resolveModule,
  chromeBinaryForLighthouse,
  proxyFor,
} from "../lib/common.mjs";

const args = parseArgs();
if (!args.url || !args.out) {
  console.error("Usage: audit.mjs --url <url> --out <dir> [--no-lighthouse] [--lh-runs N (default 3)]");
  process.exit(1);
}
const url = String(args.url);
const out = ensureDir(path.resolve(String(args.out)));
const lhRuns = Math.max(1, Number(args["lh-runs"] ?? 3));

const axePath = resolveModule("axe-core/axe.min.js");
if (!axePath) {
  console.error("axe-core missing. Run: node .claude/studio-tools/scripts/doctor.mjs --install");
  process.exit(1);
}

const playwright = loadPlaywright();
const browser = await launchBrowser(playwright, url);
const summary = { url, auditedAt: new Date().toISOString(), axe: {}, tabWalk: null, tapTargets: null, structure: null, lighthouse: null };

async function open(width, scheme) {
  const context = await browser.newContext({ viewport: viewportFor(width), colorScheme: scheme });
  const page = await context.newPage();
  await gotoAndSettle(page, url);
  return { context, page };
}

try {
  // --- axe --------------------------------------------------------------
  for (const scheme of ["light", "dark"]) {
    for (const width of [375, 1280]) {
      const { context, page } = await open(width, scheme);
      await revealAll(page);
      await page.addScriptTag({ path: axePath });
      const result = await page.evaluate(() =>
        window.axe.run(document, {
          runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"] },
        })
      );
      writeJson(path.join(out, `axe-${width}-${scheme}.json`), result.violations);
      const byImpact = { critical: 0, serious: 0, moderate: 0, minor: 0 };
      for (const v of result.violations) byImpact[v.impact] = (byImpact[v.impact] || 0) + v.nodes.length;
      summary.axe[`${width}-${scheme}`] = {
        byImpact,
        rules: result.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help })),
      };
      await context.close();
    }
  }

  // --- keyboard tab-walk -------------------------------------------------
  {
    const { context, page } = await open(1280, "light");
    const stops = [];
    let repeats = 0;
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      await page.waitForTimeout(120);
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
        const ring = cs.boxShadow && cs.boxShadow !== "none";
        if (!el.dataset.studioTabId) el.dataset.studioTabId = String(Math.random()).slice(2);
        return {
          id: el.dataset.studioTabId,
          tag: el.tagName.toLowerCase(),
          role: el.getAttribute("role"),
          text: (el.getAttribute("aria-label") || el.innerText || el.value || "").trim().slice(0, 60),
          href: el.getAttribute("href"),
          visibleIndicator: Boolean(outline || ring),
          inViewport: r.bottom > 0 && r.top < window.innerHeight,
          rect: { x: r.x, y: r.y, width: r.width, height: r.height },
        };
      });
      if (!info) break;
      if (stops.length && stops[stops.length - 1].id === info.id) {
        if (++repeats >= 2) {
          summary.tabWalkTrap = info;
          break;
        }
        continue;
      }
      if (stops.length && stops[0].id === info.id) break; // wrapped around
      stops.push(info);
      if (stops.length <= 6 && info.inViewport && info.rect.width > 0) {
        const vp = page.viewportSize();
        const pad = 16;
        const x = Math.max(0, info.rect.x - pad);
        const y = Math.max(0, info.rect.y - pad);
        const clip = { x, y, width: Math.min(vp.width - x, info.rect.width + pad * 2), height: Math.min(vp.height - y, info.rect.height + pad * 2) };
        if (clip.width > 0 && clip.height > 0) {
          await page.screenshot({ path: path.join(ensureDir(path.join(out, "focus")), `focus-${stops.length}.png`), clip });
        }
      }
    }
    writeJson(path.join(out, "tabwalk.json"), stops);
    summary.tabWalk = {
      stops: stops.length,
      withoutVisibleIndicator: stops.filter((s) => !s.visibleIndicator).map((s) => `${s.tag} "${s.text}"`),
      firstStop: stops[0] ? `${stops[0].tag} "${stops[0].text}"` : null,
      skipLinkFirst: Boolean(stops[0] && /skip/i.test(stops[0].text)),
      trap: summary.tabWalkTrap || null,
    };
    delete summary.tabWalkTrap;
    await context.close();
  }

  // --- tap targets + structure (mobile) ----------------------------------
  {
    const { context, page } = await open(375, "light");
    await revealAll(page);
    const result = await page.evaluate(() => {
      const sel = "a[href], button, input, select, textarea, summary, [role=button], [role=link], [tabindex]:not([tabindex='-1'])";
      const small = [];
      for (const el of document.querySelectorAll(sel)) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none") continue;
        const inline = cs.display === "inline" && el.closest("p, li");
        if (r.width < 44 || r.height < 44) {
          small.push({
            tag: el.tagName.toLowerCase(),
            text: (el.getAttribute("aria-label") || el.innerText || "").trim().slice(0, 40),
            width: Math.round(r.width),
            height: Math.round(r.height),
            below24: r.width < 24 || r.height < 24,
            inlineTextLink: Boolean(inline),
          });
        }
      }
      const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((h) => ({
        level: Number(h.tagName[1]),
        text: h.innerText.trim().slice(0, 60),
      }));
      const skips = [];
      for (let i = 1; i < headings.length; i++) {
        if (headings[i].level > headings[i - 1].level + 1) skips.push(`${headings[i - 1].text} (h${headings[i - 1].level}) -> ${headings[i].text} (h${headings[i].level})`);
      }
      return {
        small,
        structure: {
          lang: document.documentElement.getAttribute("lang"),
          title: document.title,
          metaDescription: document.querySelector('meta[name="description"]')?.content || null,
          ogImage: document.querySelector('meta[property="og:image"]')?.content || null,
          h1Count: headings.filter((h) => h.level === 1).length,
          headingSkips: skips,
          headings,
          hasMain: Boolean(document.querySelector("main")),
          imagesMissingAlt: [...document.querySelectorAll("img")].filter((i) => !i.hasAttribute("alt")).length,
          jsonLd: document.querySelectorAll('script[type="application/ld+json"]').length,
        },
      };
    });
    writeJson(path.join(out, "tap-targets.json"), result.small);
    summary.tapTargets = {
      under44: result.small.filter((s) => !s.inlineTextLink).length,
      under24: result.small.filter((s) => s.below24 && !s.inlineTextLink).length,
      inlineTextLinks: result.small.filter((s) => s.inlineTextLink).length,
    };
    summary.structure = result.structure;
    await context.close();
  }
} finally {
  await browser.close();
}

// --- Lighthouse (mobile preset, simulated throttling) ---------------------
if (!args["no-lighthouse"]) {
  try {
    const { default: lighthouse } = await import("lighthouse");
    const chromeLauncher = await import("chrome-launcher");
    const flags = ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"];
    const proxy = proxyFor(url);
    if (proxy) flags.push(`--proxy-server=${proxy.server}`, "--ignore-certificate-errors");
    // Warm the server so the first run doesn't pay for cold caches / JIT.
    for (let i = 0; i < 3; i++) await fetch(url).catch(() => {});
    const runs = [];
    for (let i = 0; i < lhRuns; i++) {
      const chrome = await chromeLauncher.launch({ chromePath: chromeBinaryForLighthouse(playwright), chromeFlags: flags });
      try {
        const result = await lighthouse(url, {
          port: chrome.port,
          output: ["html", "json"],
          logLevel: "error",
          onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
        });
        runs.push(result);
      } finally {
        await chrome.kill();
      }
    }
    // Median run by performance score.
    runs.sort((a, b) => (a.lhr.categories.performance.score ?? 0) - (b.lhr.categories.performance.score ?? 0));
    const median = runs[Math.floor(runs.length / 2)];
    fs.writeFileSync(path.join(out, "lighthouse.html"), median.report[0]);
    fs.writeFileSync(path.join(out, "lighthouse.json"), median.report[1]);
    const cat = median.lhr.categories;
    const a = median.lhr.audits;
    const score = (c) => (c && c.score !== null ? Math.round(c.score * 100) : null);
    summary.lighthouse = {
      runs: runs.length,
      performance: score(cat.performance),
      accessibility: score(cat.accessibility),
      bestPractices: score(cat["best-practices"]),
      seo: score(cat.seo),
      metrics: {
        FCP: a["first-contentful-paint"]?.displayValue,
        LCP: a["largest-contentful-paint"]?.displayValue,
        TBT: a["total-blocking-time"]?.displayValue,
        CLS: a["cumulative-layout-shift"]?.displayValue,
        SpeedIndex: a["speed-index"]?.displayValue,
      },
      failedAudits: Object.values(a)
        .filter((x) => x.score !== null && x.score < 0.9 && ["binary", "numeric"].includes(x.scoreDisplayMode))
        .map((x) => `${x.id}: ${x.title}${x.displayValue ? ` (${x.displayValue})` : ""}`)
        .slice(0, 25),
    };
  } catch (err) {
    summary.lighthouse = { error: String(err && err.message ? err.message : err) };
  }
}

// --- gate inputs ----------------------------------------------------------
const axeSeriousOrCritical = Object.values(summary.axe).reduce((n, v) => n + v.byImpact.serious + v.byImpact.critical, 0);
const lh = summary.lighthouse || {};
summary.gate = {
  axeSeriousOrCritical,
  lighthousePerformance: lh.performance ?? null,
  lighthouseAccessibility: lh.accessibility ?? null,
  passesAutomatedChecks:
    axeSeriousOrCritical === 0 &&
    (args["no-lighthouse"] || (lh.performance >= 90 && lh.accessibility === 100)),
};
writeJson(path.join(out, "summary.json"), summary);

const lines = [];
lines.push(`# Audit summary`, "", `- URL: ${url}`, `- Audited: ${summary.auditedAt}`, "");
lines.push(`## Gate inputs`, "");
lines.push(`- axe serious + critical nodes: **${axeSeriousOrCritical}** (must be 0)`);
if (!args["no-lighthouse"]) {
  if (lh.error) lines.push(`- Lighthouse: **error**: ${lh.error}`);
  else
    lines.push(
      `- Lighthouse (mobile): Performance **${lh.performance}** (≥ 90), Accessibility **${lh.accessibility}** (= 100), Best practices ${lh.bestPractices}, SEO ${lh.seo}`,
      `- Metrics: FCP ${lh.metrics.FCP} · LCP ${lh.metrics.LCP} · TBT ${lh.metrics.TBT} · CLS ${lh.metrics.CLS} · Speed Index ${lh.metrics.SpeedIndex}`
    );
}
lines.push(`- Automated checks pass: **${summary.gate.passesAutomatedChecks ? "yes" : "no"}**`, "");
lines.push(`## axe`, "");
for (const [k, v] of Object.entries(summary.axe)) {
  lines.push(`- ${k}: ${v.rules.length ? v.rules.map((r) => `${r.id} (${r.impact}, ${r.nodes})`).join(", ") : "no violations"}`);
}
lines.push("", `## Keyboard`, "");
lines.push(`- Tab stops: ${summary.tabWalk.stops}; first stop: ${summary.tabWalk.firstStop}; skip link first: ${summary.tabWalk.skipLinkFirst}`);
lines.push(`- Stops without a visible focus indicator: ${summary.tabWalk.withoutVisibleIndicator.length ? summary.tabWalk.withoutVisibleIndicator.join("; ") : "none"}`);
if (summary.tabWalk.trap) lines.push(`- **Focus trap** at ${summary.tabWalk.trap.tag} "${summary.tabWalk.trap.text}"`);
lines.push("", `## Tap targets (375px)`, "");
lines.push(`- Under 44px: ${summary.tapTargets.under44} · under 24px: ${summary.tapTargets.under24} · inline text links (exempt): ${summary.tapTargets.inlineTextLinks}`);
lines.push("", `## Structure`, "");
const s = summary.structure;
lines.push(`- lang: ${s.lang} · h1 count: ${s.h1Count} · main: ${s.hasMain} · images missing alt: ${s.imagesMissingAlt} · JSON-LD blocks: ${s.jsonLd}`);
lines.push(`- title: ${s.title}`, `- meta description: ${s.metaDescription}`, `- og:image: ${s.ogImage}`);
lines.push(`- heading level skips: ${s.headingSkips.length ? s.headingSkips.join("; ") : "none"}`);
if (lh.failedAudits?.length) lines.push("", `## Lighthouse audits below 90`, "", ...lh.failedAudits.map((f) => `- ${f}`));
fs.writeFileSync(path.join(out, "summary.md"), lines.join("\n") + "\n");

console.log(fs.readFileSync(path.join(out, "summary.md"), "utf8"));
