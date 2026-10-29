#!/usr/bin/env node
// Capture a page the way the Critic (or the Designer, for references) needs to
// see it: fold + full-page shots per width and color scheme, a scroll-frame
// sequence for judging motion, a reduced-motion pass, hover crops, and
// full-page tiles (1.5 viewports each) so detail stays legible.
//
// Usage:
//   node .claude/studio-tools/scripts/screenshot.mjs --url http://localhost:3100 --out <dir>
//     [--widths 375,768,1280,1920] [--schemes light,dark] [--fold-only]
//     [--frames 10] [--frames-width 1280] [--hover "selA,selB"] [--no-reduced]
//     [--no-tiles] [--max-tiles 10]
import path from "node:path";
import {
  parseArgs,
  list,
  loadPlaywright,
  launchBrowser,
  ensureDir,
  writeJson,
  viewportFor,
  revealAll,
  settle,
  gotoAndSettle,
  isLocalUrl,
} from "../lib/common.mjs";

const args = parseArgs();
if (!args.url || !args.out) {
  console.error("Usage: screenshot.mjs --url <url> --out <dir> [--widths ...] [--schemes ...] [--fold-only] [--frames N] [--hover sels] [--no-reduced]");
  process.exit(1);
}

const url = String(args.url);
const out = ensureDir(path.resolve(String(args.out)));
const widths = list(args.widths, ["375", "768", "1280", "1920"]).map(Number);
const schemes = list(args.schemes, ["light", "dark"]);
const foldOnly = Boolean(args["fold-only"]);
const frames = foldOnly ? 0 : Number(args.frames ?? 10);
const framesWidth = Number(args["frames-width"] ?? 1280);
const doReduced = !foldOnly && !args["no-reduced"];
const doTiles = !foldOnly && !args["no-tiles"];
const maxTiles = Number(args["max-tiles"] ?? 10);
const hoverSelectors = list(args.hover, null);

const playwright = loadPlaywright();
const browser = await launchBrowser(playwright, url);
const manifest = { url, capturedAt: new Date().toISOString(), files: [], overflow: {}, consoleErrors: [], pageErrors: [] };

async function newPage(width, scheme, extra = {}) {
  const context = await browser.newContext({
    viewport: viewportFor(width),
    colorScheme: scheme,
    ignoreHTTPSErrors: !isLocalUrl(url),
    ...extra,
  });
  const page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") manifest.consoleErrors.push({ width, scheme, text: msg.text() });
  });
  page.on("pageerror", (err) => manifest.pageErrors.push({ width, scheme, text: String(err) }));
  return { context, page };
}

async function shot(page, name, options = {}) {
  const file = path.join(out, name);
  ensureDir(path.dirname(file));
  await page.screenshot({ path: file, ...options });
  manifest.files.push(path.relative(out, file));
}

try {
  for (const scheme of schemes) {
    for (const width of widths) {
      const { context, page } = await newPage(width, scheme);
      await gotoAndSettle(page, url);
      await shot(page, `fold-${width}-${scheme}.png`);

      if (!foldOnly) {
        await revealAll(page);
        await settle(page, 300);
        await shot(page, `full-${width}-${scheme}.png`, { fullPage: true });
        // Image viewers shrink very tall shots; tiles keep detail legible.
        if (doTiles) {
          const height = await page.evaluate(() => document.documentElement.scrollHeight);
          const tileH = Math.round(viewportFor(width).height * 1.5);
          const count = Math.min(maxTiles, Math.ceil(height / tileH));
          for (let t = 0; t < count; t++) {
            const y = t * tileH;
            const clip = { x: 0, y, width, height: Math.min(tileH, height - y) };
            await shot(page, `tiles/${width}-${scheme}/tile-${String(t + 1).padStart(2, "0")}.png`, { fullPage: true, clip });
          }
        }
      }

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 0) manifest.overflow[`${width}-${scheme}`] = overflow;
      manifest.pageHeight = manifest.pageHeight || (await page.evaluate(() => document.documentElement.scrollHeight));
      await context.close();
    }
  }

  // Scroll-frame sequence: wheel scrolling (not scrollTo) so smooth-scroll
  // libraries and scroll-linked animations behave as they would for a person.
  if (frames > 1) {
    const { context, page } = await newPage(framesWidth, schemes[0]);
    await gotoAndSettle(page, url);
    await page.mouse.move(framesWidth / 2, 300);
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    for (let i = 0; i < frames; i++) {
      const target = Math.round((max * i) / (frames - 1));
      const current = await page.evaluate(() => window.scrollY);
      if (target > current) await page.mouse.wheel(0, target - current);
      await page.waitForTimeout(650);
      await shot(page, `frames/frame-${String(i + 1).padStart(2, "0")}.png`);
    }
    await context.close();
  }

  // Reduced motion: everything must still be visible and readable.
  if (doReduced) {
    const { context, page } = await newPage(1280, schemes[0], { reducedMotion: "reduce" });
    await gotoAndSettle(page, url);
    await shot(page, `reduced-1280-${schemes[0]}-fold.png`);
    await shot(page, `reduced-1280-${schemes[0]}-full.png`, { fullPage: true });
    await context.close();
  }

  // Hover crops: before/after for the key interactive elements.
  if (!foldOnly) {
    const { context, page } = await newPage(1280, schemes[0]);
    await gotoAndSettle(page, url);
    const handles = [];
    const sels = hoverSelectors || ["main a[href], main button", "a[href], button"];
    for (const sel of sels) {
      for (const h of await page.$$(sel)) {
        if (handles.length >= (hoverSelectors ? 12 : 3)) break;
        if (await h.isVisible()) handles.push(h);
      }
      if (!hoverSelectors && handles.length) break;
    }
    let i = 0;
    for (const h of handles) {
      i++;
      await h.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      const box = await h.boundingBox();
      if (!box) continue;
      const vp = page.viewportSize();
      const pad = 24;
      const clip = {
        x: Math.max(0, box.x - pad),
        y: Math.max(0, box.y - pad),
        width: Math.min(vp.width - Math.max(0, box.x - pad), box.width + pad * 2),
        height: Math.min(vp.height - Math.max(0, box.y - pad), box.height + pad * 2),
      };
      if (clip.width <= 0 || clip.height <= 0) continue;
      await shot(page, `hover/hover-${i}-before.png`, { clip });
      await h.hover();
      await page.waitForTimeout(400);
      await shot(page, `hover/hover-${i}-after.png`, { clip });
      await page.mouse.move(0, 0);
    }
    await context.close();
  }
} finally {
  await browser.close();
}

writeJson(path.join(out, "manifest.json"), manifest);
console.log(`Captured ${manifest.files.length} images into ${out}`);
if (Object.keys(manifest.overflow).length) console.log("Horizontal overflow (px):", manifest.overflow);
if (manifest.consoleErrors.length || manifest.pageErrors.length)
  console.log(`Console errors: ${manifest.consoleErrors.length}, page errors: ${manifest.pageErrors.length} (see manifest.json)`);
