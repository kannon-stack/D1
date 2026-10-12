import { describe, it, expect, vi, afterEach } from "vitest";
import { getPublicOrigin } from "../../src/lib/auth/publicOrigin.js";

function request(url, headers = {}) {
  return { url, headers: new Headers(headers) };
}

describe("getPublicOrigin", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("ignores the internal BASE_URL / NEXT_PUBLIC_BASE_URL", () => {
    vi.stubEnv("AUTH_PUBLIC_URL", "");
    vi.stubEnv("BASE_URL", "http://localhost:20128");
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "http://localhost:20128");

    expect(getPublicOrigin(request("http://0.0.0.0:20128/api/auth/oidc/start", { host: "192.168.1.5:20128" })))
      .toBe("http://192.168.1.5:20128");
  });

  it("honors AUTH_PUBLIC_URL, trimming trailing slashes", () => {
    vi.stubEnv("AUTH_PUBLIC_URL", "https://router.example.com//");

    expect(getPublicOrigin(request("http://localhost:20128/x", { host: "localhost:20128" })))
      .toBe("https://router.example.com");
  });

  it("prefers forwarded host and proto, using the first value of comma-joined headers", () => {
    vi.stubEnv("AUTH_PUBLIC_URL", "");

    expect(getPublicOrigin(request("http://localhost:20128/x", {
      host: "localhost:20128",
      "x-forwarded-host": "router.example.com, 127.0.0.1:20128",
      "x-forwarded-proto": "https,http",
    }))).toBe("https://router.example.com");
  });

  it("uses the request protocol when no forwarded proto is sent", () => {
    vi.stubEnv("AUTH_PUBLIC_URL", "");

    expect(getPublicOrigin(request("https://localhost:20128/x", { host: "router.example.com" })))
      .toBe("https://router.example.com");
  });

  it("falls back to the request URL origin for missing or malformed host headers", () => {
    vi.stubEnv("AUTH_PUBLIC_URL", "");

    expect(getPublicOrigin(request("http://localhost:20128/x"))).toBe("http://localhost:20128");
    expect(getPublicOrigin(request("http://localhost:20128/x", { host: "bad host/<>" })))
      .toBe("http://localhost:20128");
  });
});

describe("getPublicOrigin with a malformed AUTH_PUBLIC_URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("ignores a value without a scheme and falls back to the request", () => {
    vi.stubEnv("AUTH_PUBLIC_URL", "router.example.com");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(getPublicOrigin(request("http://localhost:20128/x", { host: "192.168.1.5:20128" })))
      .toBe("http://192.168.1.5:20128");
    expect(warn).toHaveBeenCalled();
  });

  it("drops any path so redirect_uri and redirects share one origin", () => {
    vi.stubEnv("AUTH_PUBLIC_URL", "https://router.example.com/9router/");

    expect(getPublicOrigin(request("http://localhost:20128/x", { host: "localhost:20128" })))
      .toBe("https://router.example.com");
  });
});
