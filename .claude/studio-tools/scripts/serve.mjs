#!/usr/bin/env node
// Start or stop a production Next.js server for a studio site, tracked by a pid
// file (avoids `pkill -f` patterns that can match the calling shell).
//
//   node .claude/studio-tools/scripts/serve.mjs start --dir studio-projects/<slug>/site [--port 3100]
//   node .claude/studio-tools/scripts/serve.mjs stop [--port 3100]
//   node .claude/studio-tools/scripts/serve.mjs status [--port 3100]
//
// `start` expects `npm run build` to have been run; it stops any server it
// previously started on the same port, then waits until the URL returns 200.
// If the site's next.config sets `output: "export"` (or you pass --static), it serves the
// exported `out/` folder with static-server.mjs instead of `next start`.
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "../lib/common.mjs";

const [command] = process.argv.slice(2);
const args = parseArgs();
const port = Number(args.port ?? 3100);
const url = `http://localhost:${port}`;
const pidFile = path.join(os.tmpdir(), `studio-serve-${port}.pid`);
const logFile = path.join(os.tmpdir(), `studio-serve-${port}.log`);

async function up() {
  try {
    const res = await fetch(url, { redirect: "manual" });
    return res.status;
  } catch {
    return 0;
  }
}

function stop() {
  if (!fs.existsSync(pidFile)) return false;
  const pid = Number(fs.readFileSync(pidFile, "utf8"));
  try {
    process.kill(-pid, "SIGTERM"); // whole process group (npx → next)
  } catch {
    try {
      process.kill(pid, "SIGTERM");
    } catch {}
  }
  fs.rmSync(pidFile, { force: true });
  return true;
}

if (command === "stop") {
  console.log(stop() ? `Stopped server on port ${port}` : `No studio server recorded on port ${port}`);
  process.exit(0);
}

if (command === "status") {
  const status = await up();
  console.log(status ? `${url} is up (HTTP ${status})` : `${url} is not responding`);
  process.exit(status ? 0 : 1);
}

if (command !== "start" || !args.dir) {
  console.error("Usage: serve.mjs start --dir <site dir> [--port 3100] | stop [--port 3100] | status [--port 3100]");
  process.exit(1);
}

const dir = path.resolve(String(args.dir));

// A site built with `output: "export"` has no server: `next start` refuses it. Serve its
// plain `out/` folder with the bundled static server instead (like a static host would).
const nextConfig = ["next.config.ts", "next.config.mjs", "next.config.js"]
  .map((f) => path.join(dir, f))
  .find((f) => fs.existsSync(f));
const isExport =
  Boolean(args.static) || (nextConfig && /output\s*:\s*["']export["']/.test(fs.readFileSync(nextConfig, "utf8")));
const outDir = path.join(dir, "out");
if (isExport) {
  if (!fs.existsSync(path.join(outDir, "index.html"))) {
    console.error(`No static export in ${outDir}. Run \`npm run build\` there first (next.config sets output: "export").`);
    process.exit(1);
  }
} else if (!fs.existsSync(path.join(dir, ".next"))) {
  console.error(`No .next build in ${dir}. Run \`npm run build\` there first.`);
  process.exit(1);
}

if (stop()) await new Promise((r) => setTimeout(r, 800));
if (await up()) {
  console.error(`Port ${port} is already serving something not started by this script. Stop it or use --port.`);
  process.exit(1);
}

const out = fs.openSync(logFile, "w");
const [cmd, cmdArgs] = isExport
  ? ["node", [path.join(import.meta.dirname, "static-server.mjs"), "--dir", outDir, "--port", String(port)]]
  : ["npx", ["next", "start", "-p", String(port)]];
const child = spawn(cmd, cmdArgs, {
  cwd: dir,
  detached: true,
  stdio: ["ignore", out, out],
});
child.unref();
fs.writeFileSync(pidFile, String(child.pid));

for (let i = 0; i < 90; i++) {
  await new Promise((r) => setTimeout(r, 1000));
  const status = await up();
  if (status && status < 500) {
    console.log(`Serving ${dir} at ${url} (HTTP ${status}). Log: ${logFile}`);
    process.exit(0);
  }
  if (child.exitCode !== null) break;
}
console.error(`Server did not come up. Last log lines:\n${fs.readFileSync(logFile, "utf8").split("\n").slice(-20).join("\n")}`);
stop();
process.exit(1);
