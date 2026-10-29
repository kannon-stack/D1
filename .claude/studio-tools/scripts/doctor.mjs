#!/usr/bin/env node
// Checks that everything the studio bots need is available.
//   node .claude/studio-tools/scripts/doctor.mjs            report only
//   node .claude/studio-tools/scripts/doctor.mjs --install  also npm-install missing tool deps
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs, loadPlaywright, chromiumPath, resolveModule } from "../lib/common.mjs";

const args = parseArgs();
const toolsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const results = [];
const ok = (name, detail) => results.push({ ok: true, name, detail });
const bad = (name, detail, fix) => results.push({ ok: false, name, detail, fix });

// Node
const [major, minor] = process.versions.node.split(".").map(Number);
if (major > 22 || (major === 22 && minor >= 19)) ok("node", process.versions.node);
else bad("node", process.versions.node, "Install Node 22.19 or newer (Lighthouse 13 requires it).");

// npm deps of the tools
const missing = ["axe-core/axe.min.js", "lighthouse", "chrome-launcher"].filter((m) => !resolveModule(m));
if (missing.length && args.install) {
  console.log(`Installing studio-tools dependencies in ${toolsDir} ...`);
  execSync("npm install --no-audit --no-fund", { cwd: toolsDir, stdio: "inherit" });
}
for (const m of ["axe-core/axe.min.js", "lighthouse", "chrome-launcher"]) {
  // Re-check through a fresh process: the require cache would hide new installs.
  let found = resolveModule(m);
  if (!found && args.install) {
    try {
      execSync(`node -e "require.resolve('${m}')"`, { cwd: toolsDir, stdio: "ignore" });
      found = true;
    } catch {}
  }
  if (found) ok(m.split("/")[0], "installed");
  else bad(m.split("/")[0], "missing", `Run: node ${path.relative(process.cwd(), path.join(toolsDir, "scripts/doctor.mjs"))} --install`);
}

// Playwright + Chromium
try {
  const pw = loadPlaywright();
  ok("playwright", "resolvable");
  try {
    const browser = await pw.chromium.launch({ executablePath: chromiumPath(), args: ["--no-sandbox"] });
    ok("chromium", `${browser.version()}${chromiumPath() ? ` (${chromiumPath()})` : ""}`);
    await browser.close();
  } catch (err) {
    bad("chromium", String(err.message).split("\n")[0], "Run `npx playwright install chromium`, or set STUDIO_CHROMIUM to a Chrome/Chromium binary.");
  }
} catch (err) {
  bad("playwright", "missing", err.message);
}

for (const r of results) {
  console.log(`${r.ok ? "ok  " : "FAIL"}  ${r.name.padEnd(16)} ${r.detail}${r.ok ? "" : `\n      fix: ${r.fix}`}`);
}
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n${failed} problem(s) found.` : "\nStudio tools ready.");
process.exit(failed ? 1 : 0);
