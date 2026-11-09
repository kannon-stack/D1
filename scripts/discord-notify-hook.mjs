#!/usr/bin/env node
// Claude Code PostToolUse hook (matcher: Artifact): post each newly published
// Artifact (title + link) to Discord via scripts/discord-notify.mjs.
//
// Reads the hook payload as JSON on stdin. Webhook URL comes from the
// DISCORD_WEBHOOK_URL env var (never from settings files). Always exits 0 so a
// Discord problem can never block or fail an Artifact publish.
//
// Env:
//   DISCORD_WEBHOOK_URL      required; unset => silently does nothing
//   DISCORD_THREAD_ID        optional; post into an existing forum thread
//   DISCORD_NOTIFY_UPDATES   set to 1 to also post republishes of an existing artifact
//   DISCORD_FORUM            set to 0 for a normal text channel (no thread_name sent)
//   DISCORD_ENV_FILE         optional KEY=VALUE file; default .claude/discord.env (gitignored)

import { readFileSync } from "node:fs";
import { buildPayload, sendDiscord } from "./discord-notify.mjs";

// Optional gitignored KEY=VALUE file (default .claude/discord.env) for sessions where the
// variables can't be set in the environment. Real environment variables always win.
export function loadLocalEnv(env = process.env) {
  const file = env.DISCORD_ENV_FILE || `${env.CLAUDE_PROJECT_DIR || "."}/.claude/discord.env`;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    return env;
  }
  const merged = { ...env };
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (m && merged[m[1]] === undefined) merged[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  return merged;
}

const ARTIFACT_URL = /^https:\/\/claude\.ai\/(code\/)?artifact\/[\w-]+$/;

export function planNotification(payload, env = process.env) {
  if (payload?.tool_name !== "Artifact") return null;
  const res = payload.tool_response;
  if (!res || typeof res !== "object" || typeof res.url !== "string") return null; // list/read/delete/asset calls
  if (!ARTIFACT_URL.test(res.url)) return null;
  if (res.updated && env.DISCORD_NOTIFY_UPDATES !== "1") return null;

  const title = String(res.title || "Untitled artifact");
  const bits = [res.updated ? "Updated" : "Published"];
  if (res.audience === "owner") bits.push("private: only the owner can open the link until it is shared");
  else if (res.audience) bits.push(`audience: ${res.audience}`);
  return buildPayload({
    title,
    url: res.url,
    description: bits.join(" · "),
    color: res.updated ? 15844367 : 5793266,
    threadName: env.DISCORD_FORUM === "0" ? undefined : title,
  });
}

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString("utf8");
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  try {
    const env = loadLocalEnv();
    const raw = await readStdin();
    if (env.DISCORD_WEBHOOK_URL) {
      const body = planNotification(JSON.parse(raw), env);
      if (body) await sendDiscord(env.DISCORD_WEBHOOK_URL, body, { threadId: env.DISCORD_THREAD_ID });
    }
  } catch (e) {
    console.error(`discord-notify-hook: ${e.message}`);
  }
  process.exit(0);
}
