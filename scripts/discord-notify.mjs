#!/usr/bin/env node
// Post a message (e.g. a published Artifact link) to a Discord channel via webhook.
//
// Usage:
//   DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/<id>/<token> \
//     node scripts/discord-notify.mjs --title "Weekly report" --url https://claude.ai/artifact/... \
//       [--description "text"] [--color 5793266]
//   node scripts/discord-notify.mjs --content "plain message"
//
// Forum channels: add --thread-name "<title>" (new thread per post) or set
// DISCORD_THREAD_ID to post into an existing thread.
//
// The webhook URL is read from DISCORD_WEBHOOK_URL only (never a CLI flag, so it
// stays out of shell history / process lists). Exits 0 and does nothing when the
// variable is unset, so it is safe to call unconditionally from automation.

const ALLOWED_HOSTS = new Set(["discord.com", "discordapp.com", "canary.discord.com", "ptb.discord.com"]);
const WEBHOOK_PATH = /^\/api(\/v\d+)?\/webhooks\/\d+\/[\w-]+\/?$/;

export function parseWebhookUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("DISCORD_WEBHOOK_URL is not a valid URL");
  }
  if (u.protocol !== "https:" || !ALLOWED_HOSTS.has(u.hostname) || !WEBHOOK_PATH.test(u.pathname)) {
    throw new Error("DISCORD_WEBHOOK_URL must look like https://discord.com/api/webhooks/<id>/<token>");
  }
  return u;
}

export function buildPayload({ content, title, url, description, color, threadName }) {
  const payload = { allowed_mentions: { parse: [] } }; // never ping @everyone/@here/roles
  // Forum/media channels require either thread_name (new thread per post) or DISCORD_THREAD_ID.
  if (threadName) payload.thread_name = String(threadName).slice(0, 100);
  if (content) payload.content = String(content).slice(0, 2000);
  if (title || url || description) {
    const embed = {};
    if (title) embed.title = String(title).slice(0, 256);
    if (url) embed.url = String(url);
    if (description) embed.description = String(description).slice(0, 4096);
    if (color != null && !Number.isNaN(Number(color))) embed.color = Number(color);
    payload.embeds = [embed];
  }
  if (!payload.content && !payload.embeds) throw new Error("nothing to send: pass --content or --title/--url/--description");
  return payload;
}

export async function sendDiscord(webhookUrl, payload, { fetchImpl = fetch, retries = 2, threadId } = {}) {
  const target = parseWebhookUrl(webhookUrl);
  if (threadId) target.searchParams.set("thread_id", String(threadId));
  for (let attempt = 0; ; attempt++) {
    const res = await fetchImpl(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) return;
    if (res.status === 429 && attempt < retries) {
      const wait = Number((await res.json().catch(() => ({}))).retry_after ?? 1);
      await new Promise((r) => setTimeout(r, Math.min(wait, 10) * 1000));
      continue;
    }
    const detail = await Promise.resolve()
      .then(() => res.json())
      .then((j) => j?.message, () => "");
    throw new Error(`Discord webhook failed: HTTP ${res.status}${detail ? ` - ${detail}` : ""}`);
  }
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i];
    if (!k?.startsWith("--") || argv[i + 1] === undefined) throw new Error(`bad argument: ${k}`);
    out[k.slice(2)] = argv[i + 1];
  }
  return out;
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  try {
    const webhook = process.env.DISCORD_WEBHOOK_URL;
    if (!webhook) {
      console.error("DISCORD_WEBHOOK_URL not set; skipping Discord notification");
      process.exit(0);
    }
    const args = parseArgs(process.argv.slice(2));
    await sendDiscord(webhook, buildPayload({ ...args, threadName: args["thread-name"] }), {
      threadId: process.env.DISCORD_THREAD_ID,
    });
    console.log("Posted to Discord");
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
