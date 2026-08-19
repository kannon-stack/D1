import { describe, expect, it } from "vitest";
import {
  RELAY_SECRET_HEADER,
  buildCloudflareWorkersUrl,
  buildEdgeRelayHeaders,
  buildRelayWorkerSource,
  buildVercelRelayUrl,
  generateRelaySecret,
  handleRelayRequest,
  isAllowedRelayTarget,
  isValidCloudflareAccountId,
  isValidRelayAppName,
  normalizeDenoOrgDomain,
  normalizeRelayAppName,
  publicProxyPool,
  resolveDenoRelayUrl,
  resolveRelayTargetUrl,
  secretsEqual,
} from "../../open-sse/utils/edgeRelay.js";

const SECRET = "a".repeat(64);

describe("edge relay target allowlist", () => {
  it("allows public https DNS names", () => {
    expect(isAllowedRelayTarget("https://api.openai.com/v1/models")).toBe(true);
    expect(isAllowedRelayTarget("https://httpbin.org/get")).toBe(true);
  });

  it("rejects http, credentials, localhost, metadata, and IP literals", () => {
    const blocked = [
      "http://api.openai.com",
      "https://user:pass@api.openai.com",
      "https://127.0.0.1/v1",
      "https://localhost/v1",
      "https://169.254.169.254/latest/meta-data",
      "https://10.0.0.1/",
      "https://192.168.1.1/",
      "https://[::1]/",
      "file:///etc/passwd",
    ];
    for (const url of blocked) {
      expect(isAllowedRelayTarget(url), url).toBe(false);
    }
  });

  it("rejects userinfo and absolute-path open-proxy tricks", () => {
    expect(resolveRelayTargetUrl("https://api.openai.com", "@evil.com/")).toBe("https://api.openai.com/");
    expect(resolveRelayTargetUrl("https://api.openai.com", "https://evil.com/")).toBe("https://api.openai.com/");
    expect(resolveRelayTargetUrl("https://api.openai.com", "/@evil.com/")).toBeNull();
    expect(resolveRelayTargetUrl("https://api.openai.com", "/v1/models")).toBe("https://api.openai.com/v1/models");
  });
});

describe("edge relay secrets and names", () => {
  it("compares secrets in length-constant time", () => {
    expect(secretsEqual(SECRET, SECRET)).toBe(true);
    expect(secretsEqual(SECRET, "b".repeat(64))).toBe(false);
    expect(secretsEqual("", "")).toBe(false);
    expect(secretsEqual(SECRET, SECRET.slice(0, 32))).toBe(false);
  });

  it("validates app names and Cloudflare account IDs", () => {
    expect(isValidRelayAppName("rly-ab12cd")).toBe(true);
    expect(isValidRelayAppName("cloudflare-relay")).toBe(true);
    expect(isValidRelayAppName("Bad_Name")).toBe(false);
    expect(isValidRelayAppName("foo/bar")).toBe(false);
    expect(isValidCloudflareAccountId("a".repeat(32))).toBe(true);
    expect(isValidCloudflareAccountId("acct/../../workers")).toBe(false);
    expect(normalizeRelayAppName("")).toMatch(/^rly-[a-f0-9]{12}$/);
    expect(normalizeRelayAppName("My_Relay")).toBeNull();
  });

  it("redacts relay secrets from dashboard payloads", () => {
    const publicPool = publicProxyPool({
      id: "1",
      name: "relay",
      proxyUrl: "https://rly-ab12cd.example.workers.dev",
      relaySecret: SECRET,
    });
    expect(publicPool.relaySecret).toBeUndefined();
    expect(publicPool.hasRelaySecret).toBe(true);
  });
});

describe("edge relay URL construction", () => {
  it("builds Cloudflare workers.dev URLs from the API subdomain only", () => {
    expect(buildCloudflareWorkersUrl("rly-ab12cd", "myaccount")).toBe("https://rly-ab12cd.myaccount.workers.dev");
    expect(buildCloudflareWorkersUrl("rly-ab12cd", "evil.com.workers.dev")).toBeNull();
    expect(buildCloudflareWorkersUrl("rly-ab12cd", "../x")).toBeNull();
  });

  it("prefers Deno API URLs and otherwise requires a *.deno.net org domain", () => {
    expect(resolveDenoRelayUrl({
      app: { url: "https://rly-ab12cd.my-org.deno.net" },
      projectName: "rly-ab12cd",
      orgDomain: "ignored.example",
    })).toBe("https://rly-ab12cd.my-org.deno.net");

    expect(resolveDenoRelayUrl({
      projectName: "rly-ab12cd",
      orgDomain: "https://my-org.deno.net/",
    })).toBe("https://rly-ab12cd.my-org.deno.net");

    expect(resolveDenoRelayUrl({
      projectName: "rly-ab12cd",
      orgDomain: "attacker.com",
    })).toBeNull();

    expect(normalizeDenoOrgDomain("https://My-Org.deno.net/foo")).toBe("my-org.deno.net");
  });

  it("accepts only Vercel production hostnames", () => {
    expect(buildVercelRelayUrl("rly-ab12cd-user.vercel.app")).toBe("https://rly-ab12cd-user.vercel.app");
    expect(buildVercelRelayUrl("https://evil.example")).toBeNull();
  });
});

describe("edge relay worker handler", () => {
  it("rejects missing or wrong secrets without fetching", async () => {
    let fetched = false;
    const fetchFn = async () => {
      fetched = true;
      return new Response("nope");
    };
    const denied = await handleRelayRequest(new Request("https://relay.example", {
      headers: {
        "x-relay-target": "https://api.openai.com",
        "x-relay-path": "/v1/models",
      },
    }), SECRET, fetchFn);
    expect(denied.status).toBe(401);
    expect(fetched).toBe(false);
  });

  it("forwards authorized https requests and strips relay headers", async () => {
    const fetchFn = async (url, init) => {
      expect(url).toBe("https://api.openai.com/v1/models");
      expect(init.redirect).toBe("manual");
      expect(init.headers.get("x-9r-relay-key")).toBeNull();
      expect(init.headers.get("x-relay-target")).toBeNull();
      expect(init.headers.get("authorization")).toBe("Bearer sk-test");
      return new Response("ok", { status: 200 });
    };
    const allowed = await handleRelayRequest(new Request("https://relay.example", {
      headers: {
        [RELAY_SECRET_HEADER]: SECRET,
        "x-relay-target": "https://api.openai.com",
        "x-relay-path": "/v1/models",
        authorization: "Bearer sk-test",
      },
    }), SECRET, fetchFn);
    expect(allowed.status).toBe(200);
    expect(await allowed.text()).toBe("ok");
  });

  it("does not fetch blocked targets even with a valid secret", async () => {
    let fetched = false;
    const fetchFn = async () => {
      fetched = true;
      return new Response("nope");
    };
    const denied = await handleRelayRequest(new Request("https://relay.example", {
      headers: {
        [RELAY_SECRET_HEADER]: SECRET,
        "x-relay-target": "http://127.0.0.1",
        "x-relay-path": "/secret",
      },
    }), SECRET, fetchFn);
    expect(denied.status).toBe(400);
    expect(fetched).toBe(false);
  });

  it("embeds the secret and request handler in generated worker source", () => {
    const secret = generateRelaySecret();
    const source = buildRelayWorkerSource({ runtime: "cloudflare", secret });
    expect(source).toContain(JSON.stringify(secret));
    expect(source).toContain("x-9r-relay-key");
    expect(source).toContain("redirect: \"manual\"");
    expect(source).not.toContain("observability: { enabled: true }");
  });
});

describe("edge relay client headers", () => {
  it("requires a secret and blocks non-https targets before the hop", () => {
    expect(() => buildEdgeRelayHeaders("https://api.openai.com/v1", {}, "")).toThrow(/auth secret/);
    expect(() => buildEdgeRelayHeaders("http://api.openai.com/v1", {}, SECRET)).toThrow(/not allowed/);
    const headers = buildEdgeRelayHeaders("https://api.openai.com/v1/models", { authorization: "Bearer x" }, SECRET);
    expect(headers["x-relay-target"]).toBe("https://api.openai.com");
    expect(headers["x-relay-path"]).toBe("/v1/models");
    expect(headers[RELAY_SECRET_HEADER]).toBe(SECRET);
  });
});
