// Shared helpers for the studio scripts: argument parsing, Playwright loading,
// Chromium discovery and proxy settings.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

// createRequire (not `import`) so a globally installed Playwright found via
// NODE_PATH works as well as a local one.
const require = createRequire(import.meta.url);

export function parseArgs(argv = process.argv.slice(2)) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      args[key] = true;
    } else {
      args[key] = next;
      i++;
    }
  }
  return args;
}

export function list(value, fallback) {
  if (value === undefined || value === true) return fallback;
  return String(value)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function loadPlaywright() {
  try {
    return require("playwright");
  } catch {
    try {
      return require("@playwright/test");
    } catch {
      throw new Error(
        "Playwright not found. Install it with `npm i -g playwright && npx playwright install chromium`, " +
          "or set NODE_PATH to a folder that contains it."
      );
    }
  }
}

export function tryRequire(name) {
  try {
    return require(name);
  } catch {
    return null;
  }
}

export function resolveModule(name) {
  try {
    return require.resolve(name);
  } catch {
    return null;
  }
}

// STUDIO_CHROMIUM wins; then the preinstalled cloud-container browser; else
// whatever Playwright ships with (undefined = Playwright's own default).
export function chromiumPath() {
  if (process.env.STUDIO_CHROMIUM) return process.env.STUDIO_CHROMIUM;
  const cloud = "/opt/pw-browsers/chromium";
  if (fs.existsSync(cloud)) return cloud;
  return undefined;
}

export function chromeBinaryForLighthouse(playwright) {
  return chromiumPath() || playwright.chromium.executablePath();
}

export function isLocalUrl(url) {
  try {
    const { hostname } = new URL(url);
    return ["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"].includes(hostname);
  } catch {
    return false;
  }
}

// Remote reference sites go through the environment's HTTPS proxy, if any.
export function proxyFor(url) {
  const raw = process.env.HTTPS_PROXY || process.env.https_proxy;
  if (!raw || isLocalUrl(url)) return undefined;
  const parsed = new URL(raw);
  const proxy = { server: `${parsed.protocol}//${parsed.host}` };
  if (parsed.username) proxy.username = decodeURIComponent(parsed.username);
  if (parsed.password) proxy.password = decodeURIComponent(parsed.password);
  return proxy;
}

export async function launchBrowser(playwright, url) {
  const proxy = proxyFor(url);
  return playwright.chromium.launch({
    executablePath: chromiumPath(),
    args: ["--no-sandbox"],
    ...(proxy ? { proxy } : {}),
  });
}

export function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function writeJson(file, data) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

export const DEFAULT_HEIGHTS = { 375: 812, 768: 1024, 1280: 800, 1440: 900, 1920: 1080 };

export function viewportFor(width) {
  const w = Number(width);
  return { width: w, height: DEFAULT_HEIGHTS[w] || Math.round(w * 0.625) };
}

// Scroll the whole page in steps so `whileInView` / IntersectionObserver
// reveals fire before a full-page screenshot, then return to the top.
export async function revealAll(page, { stepRatio = 0.6, pauseMs = 120 } = {}) {
  await page.evaluate(
    async ({ stepRatio, pauseMs }) => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
      const step = Math.max(200, Math.round(window.innerHeight * stepRatio));
      let y = 0;
      for (let guard = 0; guard < 400; guard++) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (y >= max) break;
        y = Math.min(max, y + step);
        window.scrollTo(0, y);
        await sleep(pauseMs);
      }
      await sleep(400);
      window.scrollTo(0, 0);
      await sleep(400);
    },
    { stepRatio, pauseMs }
  );
}

export async function settle(page, ms = 600) {
  await page.evaluate(() => (document.fonts ? document.fonts.ready : null)).catch(() => {});
  await page.waitForTimeout(ms);
}

export async function gotoAndSettle(page, url) {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  } catch {
    // Long-polling or analytics can keep the network busy; fall back to load.
    await page.goto(url, { waitUntil: "load", timeout: 45000 });
  }
  await settle(page);
}
