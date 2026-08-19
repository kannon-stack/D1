import { randomBytes } from "crypto";

export const RELAY_SECRET_HEADER = "x-9r-relay-key";
export const RELAY_TYPES = new Set(["vercel", "cloudflare", "deno"]);

const RELAY_APP_NAME_RE = /^[a-z][a-z0-9-]{0,61}[a-z0-9]$/;
const CLOUDFLARE_ACCOUNT_ID_RE = /^[a-f0-9]{32}$/i;
const WORKERS_SUBDOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const DENO_ORG_DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.deno\.net$/;

export function generateRelaySecret() {
  return randomBytes(32).toString("hex");
}

export function generateRelayAppName() {
  return `rly-${randomBytes(6).toString("hex")}`;
}

export function isValidRelayAppName(name) {
  return typeof name === "string" && RELAY_APP_NAME_RE.test(name) && !name.includes("--");
}

export function isValidCloudflareAccountId(accountId) {
  return typeof accountId === "string" && CLOUDFLARE_ACCOUNT_ID_RE.test(accountId);
}

export function normalizeRelayAppName(value, fallback = generateRelayAppName()) {
  const trimmed = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!trimmed) return fallback;
  return isValidRelayAppName(trimmed) ? trimmed : null;
}

export function secretsEqual(left, right) {
  if (typeof left !== "string" || typeof right !== "string") return false;
  if (left.length !== right.length || left.length === 0) return false;
  let mismatch = 0;
  for (let i = 0; i < left.length; i++) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return mismatch === 0;
}

export function isBlockedRelayHostname(hostname) {
  if (!hostname || typeof hostname !== "string") return true;
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host === "local" || host.endsWith(".local")) return true;
  if (host === "internal" || host.endsWith(".internal")) return true;
  if (host === "metadata.google.internal") return true;
  if (host.includes(":")) return true;
  if (/^\d+$/.test(host)) return true;
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return true;
  return false;
}

export function isAllowedRelayTarget(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:") return false;
  if (parsed.username || parsed.password) return false;
  if (isBlockedRelayHostname(parsed.hostname)) return false;
  return true;
}

export function resolveRelayTargetUrl(target, relayPath) {
  let base;
  try {
    base = new URL(target);
  } catch {
    return null;
  }
  if (!isAllowedRelayTarget(base.href)) return null;
  const path = typeof relayPath === "string" && relayPath.startsWith("/") ? relayPath : "/";
  if (path.includes("://") || path.includes("\\") || path.includes("@")) return null;
  let resolved;
  try {
    resolved = new URL(path, `${base.origin}/`);
  } catch {
    return null;
  }
  if (resolved.origin !== base.origin) return null;
  if (!isAllowedRelayTarget(resolved.href)) return null;
  return resolved.href;
}

export async function handleRelayRequest(request, secret, fetchFn) {
  const doFetch = fetchFn || fetch;
  const provided = request.headers.get("x-9r-relay-key");
  if (!secretsEqual(provided, secret)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const target = request.headers.get("x-relay-target");
  const relayPath = request.headers.get("x-relay-path") || "/";
  const targetUrl = resolveRelayTargetUrl(target, relayPath);
  if (!targetUrl) {
    return new Response(JSON.stringify({ error: "Invalid relay target" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const headers = new Headers(request.headers);
  const drop = [
    "x-relay-target",
    "x-relay-path",
    "x-9r-relay-key",
    "host",
    "cookie",
    "cookie2",
    "connection",
    "keep-alive",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "proxy-authorization",
    "proxy-connection",
    "cf-connecting-ip",
    "cf-ipcountry",
    "x-forwarded-for",
    "x-forwarded-host",
    "x-forwarded-proto",
    "x-real-ip",
    "forwarded",
  ];
  for (const name of drop) headers.delete(name);

  const init = {
    method: request.method,
    headers,
    redirect: "manual",
  };
  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = request.body;
    init.duplex = "half";
  }

  try {
    const response = await doFetch(targetUrl, init);
    return new Response(response.body, {
      status: response.status,
      headers: response.headers,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Upstream fetch failed" }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
}

function workerPrelude(secret) {
  return `const RELAY_SECRET = ${JSON.stringify(secret)};

${secretsEqual.toString()}

${isBlockedRelayHostname.toString()}

${isAllowedRelayTarget.toString()}

${resolveRelayTargetUrl.toString()}

${handleRelayRequest.toString()}
`;
}

export function buildRelayWorkerSource({ runtime, secret }) {
  if (typeof secret !== "string" || secret.length < 32) {
    throw new Error("Relay secret is required");
  }
  const prelude = workerPrelude(secret);
  if (runtime === "cloudflare") {
    return `${prelude}
export default {
  fetch(request) {
    return handleRelayRequest(request, RELAY_SECRET);
  },
};
`;
  }
  if (runtime === "deno") {
    return `${prelude}
Deno.serve((request) => handleRelayRequest(request, RELAY_SECRET));
`;
  }
  if (runtime === "vercel") {
    return `${prelude}
export const config = { runtime: "edge" };

export default function handler(request) {
  return handleRelayRequest(request, RELAY_SECRET);
}
`;
  }
  throw new Error(`Unknown relay runtime: ${runtime}`);
}

export function publicProxyPool(pool) {
  if (!pool || typeof pool !== "object") return pool;
  const { relaySecret, ...rest } = pool;
  return {
    ...rest,
    hasRelaySecret: Boolean(relaySecret),
  };
}

export function buildEdgeRelayHeaders(targetUrl, requestHeaders, relaySecret) {
  if (typeof relaySecret !== "string" || !relaySecret) {
    throw new Error("Edge relay is missing its auth secret. Redeploy the relay from Proxy Pools.");
  }
  const parsed = new URL(targetUrl);
  if (!isAllowedRelayTarget(parsed.href)) {
    throw new Error("Relay target is not allowed");
  }
  const headers = requestHeaders instanceof Headers
    ? Object.fromEntries(requestHeaders.entries())
    : { ...(requestHeaders || {}) };
  headers["x-relay-target"] = `${parsed.protocol}//${parsed.host}`;
  headers["x-relay-path"] = `${parsed.pathname}${parsed.search}`;
  headers[RELAY_SECRET_HEADER] = relaySecret;
  return headers;
}

export function normalizeDenoOrgDomain(input) {
  let value = typeof input === "string" ? input.trim().toLowerCase() : "";
  value = value.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!DENO_ORG_DOMAIN_RE.test(value)) return null;
  return value;
}

function asHttpsUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const raw = value.trim();
  try {
    const parsed = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (parsed.protocol !== "https:") return null;
    if (parsed.username || parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

function collectUrlCandidates(obj, out) {
  if (!obj || typeof obj !== "object") return;
  if (typeof obj.url === "string") out.push(obj.url);
  if (typeof obj.defaultDomain === "string") out.push(obj.defaultDomain);
  if (typeof obj.domain === "string") out.push(obj.domain);
  if (Array.isArray(obj.domains)) {
    for (const item of obj.domains) {
      if (typeof item === "string") out.push(item);
      else if (item && typeof item === "object") {
        if (typeof item.domain === "string") out.push(item.domain);
        if (typeof item.url === "string") out.push(item.url);
      }
    }
  }
}

export function resolveDenoRelayUrl({ app, revision, projectName, orgDomain } = {}) {
  const candidates = [];
  collectUrlCandidates(app, candidates);
  collectUrlCandidates(revision, candidates);
  for (const candidate of candidates) {
    const parsed = asHttpsUrl(candidate);
    if (!parsed) continue;
    if (parsed.hostname.endsWith(".deno.net") || parsed.hostname.endsWith(".deno.dev")) {
      return parsed.origin;
    }
  }
  const orgHost = normalizeDenoOrgDomain(orgDomain);
  if (!orgHost || !isValidRelayAppName(projectName)) return null;
  const parsed = asHttpsUrl(`https://${projectName}.${orgHost}`);
  if (!parsed || parsed.hostname !== `${projectName}.${orgHost}`) return null;
  return parsed.origin;
}

export function buildCloudflareWorkersUrl(projectName, subdomain) {
  if (!isValidRelayAppName(projectName)) return null;
  if (typeof subdomain !== "string" || !WORKERS_SUBDOMAIN_RE.test(subdomain)) return null;
  const hostname = `${projectName}.${subdomain}.workers.dev`;
  const parsed = asHttpsUrl(`https://${hostname}`);
  if (!parsed || parsed.hostname !== hostname) return null;
  return parsed.origin;
}

export function buildVercelRelayUrl(readyUrl) {
  const parsed = asHttpsUrl(typeof readyUrl === "string" && readyUrl.includes("://") ? readyUrl : `https://${readyUrl || ""}`);
  if (!parsed) return null;
  const host = parsed.hostname;
  if (!host.endsWith(".vercel.app") && !host.endsWith(".now.sh")) return null;
  return parsed.origin;
}
